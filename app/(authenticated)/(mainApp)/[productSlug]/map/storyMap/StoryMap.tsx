import {ReadOutlined} from "@ant-design/icons"
import {Timestamp, collection, doc, updateDoc} from "firebase/firestore"
import {motion, useMotionValue, useTransform} from "framer-motion"
import {useEffect, useRef, useState} from "react"
import {useCollectionData, useDocumentData} from "react-firebase-hooks/firestore"
import invariant from "tiny-invariant"

import type {DragInfo} from "./utils/types"
import type {FC} from "react"
import type {Id, WithDocumentData} from "~/types"
import type {Product} from "~/types/db/Products"
import type {
	Epic as EpicType,
	Feature as FeatureType,
	StoryMapState,
	Story as StoryType,
} from "~/types/db/StoryMapStates"

import Epic from "./Epic"
import Feature from "./Feature"
import Story from "./Story"
import {elementRegistry, layerBoundaries} from "./utils/globals"
import {useGenMeta} from "./utils/meta"
import {StoryMapStateConverter} from "~/types/db/StoryMapStates"
import {VersionConverter} from "~/types/db/Versions"
import {db} from "~/utils/firebase"
import {avg} from "~/utils/math"
import {sortFeatures} from "~/utils/storyMap"

export type StoryMapProps = {
	activeProduct: WithDocumentData<Product>
	currentVersionId: Id | `__ALL_VERSIONS__`
}

const StoryMap: FC<StoryMapProps> = ({activeProduct, currentVersionId}) => {
	const [storyMapState] = useDocumentData(
		doc(db, `StoryMapStates`, activeProduct.storyMapStateId).withConverter(StoryMapStateConverter),
		{
			initialValue: {
				id: activeProduct.storyMapStateId,
				items: {},
				productId: activeProduct.id,
				ref: doc(db, `StoryMapStates`, activeProduct.storyMapStateId).withConverter(StoryMapStateConverter),
			},
		},
	)
	invariant(storyMapState, `storyMapState must exist`)

	const [versions] = useCollectionData(
		collection(db, `StoryMapStates`, activeProduct.storyMapStateId, `Versions`).withConverter(VersionConverter),
	)

	const meta = useGenMeta(storyMapState, versions ?? [], currentVersionId)

	const [dragInfo, setDragInfo] = useState<DragInfo>({
		mousePos: [useMotionValue(0), useMotionValue(0)],
		itemBeingDraggedId: undefined,
		offsetToTopLeft: [0, 0],
		offsetToMiddle: [0, 0],
	})

	useEffect(() => {
		if (typeof window !== `undefined`) {
			const handlePointerMove = (e: PointerEvent) => {
				dragInfo.mousePos[0].set(e.clientX)
				dragInfo.mousePos[1].set(e.clientY)
			}
			window.addEventListener(`pointermove`, handlePointerMove)

			return () => {
				window.removeEventListener(`pointermove`, handlePointerMove)
			}
		}
	}, [dragInfo.mousePos])

	const onPanStart = (event: MouseEvent | TouchEvent | PointerEvent) => {
		const entry = Object.entries(elementRegistry).find(([, element]) => element?.contains(event.target as Node))
		if (!entry || !entry[1]) return
		const [id, element] = entry
		const container = element.parentElement!
		setDragInfo((prev) => ({
			...prev,
			itemBeingDraggedId: id as Id,
			offsetToTopLeft: [
				prev.mousePos[0].get() - container.getBoundingClientRect().left,
				prev.mousePos[1].get() - container.getBoundingClientRect().top,
			],
			offsetToMiddle: [
				container.getBoundingClientRect().left + container.offsetWidth / 2 - prev.mousePos[0].get(),
				container.getBoundingClientRect().top + container.offsetHeight / 2 - prev.mousePos[1].get(),
			],
		}))
	}

	const operationCompleteCondition = useRef<((storyMapState: StoryMapState) => boolean) | undefined>(undefined)
	const onPan = async () => {
		if (dragInfo.itemBeingDraggedId === undefined) return

		if (operationCompleteCondition.current) {
			const isOperationComplete = operationCompleteCondition.current(storyMapState)
			if (isOperationComplete) operationCompleteCondition.current = undefined
			else return
		}

		const x = dragInfo.mousePos[0].get() + dragInfo.offsetToMiddle[0]
		const y = dragInfo.mousePos[1].get()

		switch (storyMapState.items[dragInfo.itemBeingDraggedId]!.type) {
			case `epic`: {
				if (y <= layerBoundaries[0]) {
					// Reorder epics
					const currentEpicIndex = meta.epics.findIndex((epic) => epic.id === dragInfo.itemBeingDraggedId)
					const currentEpic = meta.epics[currentEpicIndex]
					const currentEpicLeft =
						elementRegistry[currentEpic?.id ?? (`` as Id)]?.parentElement!.getBoundingClientRect().left
					const currentEpicRight =
						elementRegistry[currentEpic?.id ?? (`` as Id)]?.parentElement!.getBoundingClientRect().right
					const prevEpic = meta.epics[currentEpicIndex - 1]
					const prevEpicLeft = elementRegistry[prevEpic?.id ?? (`` as Id)]?.parentElement!.getBoundingClientRect().left
					const nextEpic = meta.epics[currentEpicIndex + 1]
					const nextEpicRight =
						elementRegistry[nextEpic?.id ?? (`` as Id)]?.parentElement!.getBoundingClientRect().right

					const boundaryLeft = prevEpicLeft && currentEpicRight ? avg(prevEpicLeft, currentEpicRight) : -Infinity
					const boundaryRight = currentEpicLeft && nextEpicRight ? avg(currentEpicLeft, nextEpicRight) : Infinity

					if (x < boundaryLeft) {
						const data: {[key: `items.${string}.userValue`]: number} = {
							[`items.${prevEpic!.id}.userValue`]: currentEpic!.userValue,
							[`items.${currentEpic!.id}.userValue`]: prevEpic!.userValue,
						}
						operationCompleteCondition.current = (storyMapState) => {
							const item = storyMapState.items[currentEpic!.id]
							if (item?.type !== `epic`) return false
							return item.userValue === prevEpic!.userValue
						}
						await updateDoc(storyMapState.ref, data)
					} else if (x > boundaryRight) {
						const data: {[key: `items.${string}.userValue`]: number} = {
							[`items.${nextEpic!.id}.userValue`]: currentEpic!.userValue,
							[`items.${currentEpic!.id}.userValue`]: nextEpic!.userValue,
						}
						operationCompleteCondition.current = (storyMapState) => {
							const item = storyMapState.items[currentEpic!.id]
							if (item?.type !== `epic`) return false
							return item.userValue === nextEpic!.userValue
						}
						await updateDoc(storyMapState.ref, data)
					}
				} else {
					// Epic to feature
					const allFeatureBounds: Array<{id: Id; left: number; right: number}> = []
					for (const epic of meta.epics) {
						for (const featureId of epic.childrenIds) {
							const featureRect = elementRegistry[featureId]?.parentElement?.getBoundingClientRect()
							const prevRect = allFeatureBounds.at(-1) ?? {right: -Infinity}
							if (featureRect)
								allFeatureBounds.push({
									left: prevRect.right,
									right: featureRect.left + featureRect.width / 2,
									id: featureId,
								})
						}
						const prevRect = allFeatureBounds.at(-1) ?? {right: -Infinity}
						const epicRect = elementRegistry[epic.id]?.parentElement?.getBoundingClientRect()
						if (epicRect) allFeatureBounds.push({left: prevRect.right, right: epicRect.right, id: epic.id})
					}
					allFeatureBounds.at(-1)!.right = Infinity

					const itemId = allFeatureBounds.find((bound) => x >= bound.left && x <= bound.right)!.id
					let parentId: Id
					let featureIndex: number
					if (storyMapState.items[itemId]!.type === `epic`) {
						parentId = itemId
						const epic = meta.epics.find((epic) => epic.id === itemId)!
						featureIndex = epic.childrenIds.length
					} else {
						const feature = meta.features.find((feature) => feature.id === itemId)!
						parentId = feature.parentId
						featureIndex = feature.position
					}
					if (parentId === dragInfo.itemBeingDraggedId) return

					const parent = meta.epics.find((epic) => epic.id === parentId)!
					const prevFeatureUserValue =
						meta.features.find((feature) => feature.id === parent.childrenIds[featureIndex - 1])?.userValue ?? 0
					const nextFeatureUserValue =
						meta.features.find((feature) => feature.id === parent.childrenIds[featureIndex])?.userValue ?? 1

					const itemBeingDragged = storyMapState.items[dragInfo.itemBeingDraggedId] as EpicType
					const data: {[key: `items.${Id}.`]: FeatureType} = {
						[`items.${dragInfo.itemBeingDraggedId}`]: {
							type: `feature` as const,
							description: itemBeingDragged.description,
							effort: 0.5,
							name: itemBeingDragged.name,
							userValue: avg(prevFeatureUserValue, nextFeatureUserValue),
							parentId,
						},
					}

					const id = dragInfo.itemBeingDraggedId
					operationCompleteCondition.current = (storyMapState) => {
						const item = storyMapState.items[id]
						return item?.type === `feature` && item.parentId === parentId
					}
					await updateDoc(storyMapState.ref, data)
				}
				break
			}
			case `feature`: {
				if (y <= layerBoundaries[0]) {
					// Feature to epic
					const allEpicBounds: Array<{id: Id | `end`; left: number; right: number}> = []
					for (const epic of meta.epics) {
						const epicRect = elementRegistry[epic.id]?.parentElement?.getBoundingClientRect()
						const prevRect = allEpicBounds.at(-1) ?? {right: -Infinity}
						if (epicRect)
							allEpicBounds.push({
								left: prevRect.right,
								right: epicRect.left + epicRect.width / 2,
								id: epic.id,
							})
					}
					allEpicBounds.push({left: allEpicBounds.at(-1)!.right, right: Infinity, id: `end`})

					const itemId = allEpicBounds.find((bound) => x >= bound.left && x <= bound.right)!.id
					const itemIndex = itemId === `end` ? meta.epics.length : meta.epics.findIndex((epic) => epic.id === itemId)
					const prevEpicUserValue = meta.epics[itemIndex - 1]?.userValue ?? 0
					const nextEpicUserValue = meta.epics[itemIndex]?.userValue ?? 1

					const itemBeingDragged = meta.features.find((feature) => feature.id === dragInfo.itemBeingDraggedId)!
					const data: {[key: `items.${Id}.`]: EpicType} = {
						[`items.${dragInfo.itemBeingDraggedId}`]: {
							type: `epic` as const,
							description: itemBeingDragged.description,
							effort: 0.5,
							name: itemBeingDragged.name,
							userValue: avg(prevEpicUserValue, nextEpicUserValue),
							keeperIds: [],
						},
					}

					const id = dragInfo.itemBeingDraggedId
					operationCompleteCondition.current = (storyMapState) => {
						const item = storyMapState.items[id]
						return item?.type === `epic`
					}
					await updateDoc(storyMapState.ref, data)
				} else if (y <= layerBoundaries[1]) {
					// Reorder features
					const currentFeature = meta.features.find((feature) => feature.id === dragInfo.itemBeingDraggedId)!
					const currentFeatureRect = elementRegistry[currentFeature.id]?.parentElement?.getBoundingClientRect()
					const parentRect = elementRegistry[currentFeature.parentId]?.parentElement?.getBoundingClientRect()
					if (!parentRect || !currentFeatureRect) return
					if (x < parentRect.left || x > parentRect.right) {
						// Move to another epic
						const currentParent = meta.epics.find((epic) => epic.id === currentFeature.parentId)!
						const newParent =
							x < parentRect.left ? meta.epics[currentParent.position - 1] : meta.epics[currentParent.position + 1]
						const newParentRect = elementRegistry[newParent?.id ?? (`` as Id)]?.parentElement?.getBoundingClientRect()
						if (!newParent || !newParentRect) return
						const siblings = sortFeatures(meta.features.filter(({parentId}) => parentId === newParent.id))
						if (x < parentRect.left) {
							// Move to epic on the left
							const prevFeature = siblings.at(-1)
							const prevFeatureRect =
								elementRegistry[prevFeature?.id ?? (`` as Id)]?.parentElement?.getBoundingClientRect()
							const boundary = avg(
								prevFeatureRect
									? prevFeatureRect.left + prevFeatureRect.width / 2
									: newParentRect.left + newParentRect.width / 2,
								currentFeatureRect.left + currentFeatureRect.width / 2,
							)
							if (x > boundary) return
							const prevFeatureUserValue = siblings.at(-1)?.userValue ?? 0
							const data: {[key: `items.${Id}.`]: FeatureType} = {
								[`items.${dragInfo.itemBeingDraggedId}`]: {
									type: `feature` as const,
									description: currentFeature.description,
									effort: 0.5,
									name: currentFeature.name,
									userValue: avg(prevFeatureUserValue, 1),
									parentId: newParent.id,
								},
							}
							const id = dragInfo.itemBeingDraggedId
							operationCompleteCondition.current = (storyMapState) => {
								const item = storyMapState.items[id]
								return item?.type === `feature` && item.parentId === newParent.id
							}
							await updateDoc(storyMapState.ref, data)
						} else {
							// Move to epic on the right
							const nextFeature = siblings[currentFeature.position]
							const nextFeatureRect =
								elementRegistry[nextFeature?.id ?? (`` as Id)]?.parentElement?.getBoundingClientRect()
							const boundary = avg(
								currentFeatureRect.right + currentFeatureRect.width / 2,
								nextFeatureRect
									? nextFeatureRect.left + nextFeatureRect.width / 2
									: newParentRect.left + newParentRect.width / 2,
							)
							if (x < boundary) return
							const nextFeatureUserValue = siblings[currentFeature.position]?.userValue ?? 1
							const data: {[key: `items.${Id}.`]: FeatureType} = {
								[`items.${dragInfo.itemBeingDraggedId}`]: {
									type: `feature` as const,
									description: currentFeature.description,
									effort: 0.5,
									name: currentFeature.name,
									userValue: avg(nextFeatureUserValue, 0),
									parentId: newParent.id,
								},
							}
							const id = dragInfo.itemBeingDraggedId
							operationCompleteCondition.current = (storyMapState) => {
								const item = storyMapState.items[id]
								return item?.type === `feature` && item.parentId === newParent.id
							}
							await updateDoc(storyMapState.ref, data)
						}
					} else {
						// Reorder within epic
						const siblings = sortFeatures(meta.features.filter(({parentId}) => parentId === currentFeature.parentId))
						const prevFeature = siblings[currentFeature.position - 1]
						const nextFeature = siblings[currentFeature.position + 1]
						const currentFeatureRect =
							elementRegistry[dragInfo.itemBeingDraggedId]?.parentElement?.getBoundingClientRect()
						const prevFeatureRect =
							elementRegistry[
								siblings[currentFeature.position - 1]?.id ?? (`` as Id)
							]?.parentElement?.getBoundingClientRect()
						const nextFeatureRect =
							elementRegistry[
								siblings[currentFeature.position + 1]?.id ?? (`` as Id)
							]?.parentElement?.getBoundingClientRect()

						const leftBoundary =
							currentFeatureRect && prevFeatureRect ? avg(prevFeatureRect.left, currentFeatureRect.right) : -Infinity
						const rightBoundary =
							currentFeatureRect && nextFeatureRect ? avg(currentFeatureRect.left, nextFeatureRect.right) : Infinity

						if (x < leftBoundary) {
							const data: {[key: `items.${string}.userValue`]: number} = {
								[`items.${prevFeature!.id}.userValue`]: currentFeature.userValue,
								[`items.${currentFeature.id}.userValue`]: prevFeature!.userValue,
							}
							operationCompleteCondition.current = (storyMapState) => {
								const item = storyMapState.items[currentFeature.id]
								if (item?.type !== `feature`) return false
								return item.userValue === prevFeature!.userValue
							}
							await updateDoc(storyMapState.ref, data)
						} else if (x > rightBoundary) {
							const data: {[key: `items.${string}.userValue`]: number} = {
								[`items.${nextFeature!.id}.userValue`]: currentFeature.userValue,
								[`items.${currentFeature.id}.userValue`]: nextFeature!.userValue,
							}
							operationCompleteCondition.current = (storyMapState) => {
								const item = storyMapState.items[currentFeature.id]
								if (item?.type !== `feature`) return false
								return item.userValue === nextFeature!.userValue
							}
							await updateDoc(storyMapState.ref, data)
						}
					}
				} else {
					// Feature to story
					const allFeaturesSorted = meta.features.sort((a, b) => {
						const aParent = meta.epics.find((epic) => epic.id === a.parentId)!
						const bParent = meta.epics.find((epic) => epic.id === b.parentId)!
						return aParent.position - bParent.position || a.position - b.position
					})
					const allFeatureBounds: Array<{id: Id; left: number; right: number}> = []
					for (const feature of allFeaturesSorted) {
						const featureRect = elementRegistry[feature.id]?.parentElement?.getBoundingClientRect()
						const prevFeature = allFeaturesSorted[feature.position - 1]
						const nextFeature = allFeaturesSorted[feature.position + 1]
						const prevRect = elementRegistry[prevFeature?.id ?? (`` as Id)]?.parentElement?.getBoundingClientRect() ?? {
							right: -Infinity,
						}
						const nextRect = elementRegistry[nextFeature?.id ?? (`` as Id)]?.parentElement?.getBoundingClientRect() ?? {
							left: Infinity,
						}

						if (featureRect)
							allFeatureBounds.push({
								left: prevRect.right,
								right: avg(featureRect.right, nextRect.left),
								id: feature.id,
							})
					}
					allFeatureBounds.at(-1)!.right = Infinity

					const hoveringFeatureId = allFeatureBounds.find((feature) => x >= feature.left && x <= feature.right)?.id
					const hoveringFeature = meta.features.find((feature) => feature.id === hoveringFeatureId)
					if (
						!hoveringFeature ||
						hoveringFeature.id === dragInfo.itemBeingDraggedId ||
						currentVersionId === `__ALL_VERSIONS__`
					)
						return

					const featureBeingDragged = meta.features.find((feature) => feature.id === dragInfo.itemBeingDraggedId)!
					const data: {[key: `items.${string}.`]: StoryType} = {
						[`items.${dragInfo.itemBeingDraggedId}`]: {
							type: `story` as const,
							acceptanceCriteria: [],
							branchName: null,
							createdAt: Timestamp.now(),
							description: featureBeingDragged.description,
							designLink: null,
							ethicsApproved: null,
							ethicsColumn: null,
							ethicsVotes: [],
							name: featureBeingDragged.name,
							pageLink: null,
							points: 0,
							sprintColumn: `productBacklog` as const,
							parentId: hoveringFeature.id,
							versionId: currentVersionId,
						},
					}
					operationCompleteCondition.current = (storyMapState) => {
						const item = storyMapState.items[featureBeingDragged.id]
						return item?.type === `story`
					}
					await updateDoc(storyMapState.ref, data)
				}
				break
			}
			case `story`: {
				if (y > layerBoundaries[1]) {
					// Move story between features
					const allFeaturesSorted = meta.features.sort((a, b) => {
						const aParent = meta.epics.find((epic) => epic.id === a.parentId)!
						const bParent = meta.epics.find((epic) => epic.id === b.parentId)!
						return aParent.position - bParent.position || a.position - b.position
					})
					const allFeatureBounds: Array<{id: Id; left: number; right: number}> = []
					for (const feature of allFeaturesSorted) {
						const featureRect = elementRegistry[feature.id]?.parentElement?.getBoundingClientRect()
						const prevFeature = allFeaturesSorted[feature.position - 1]
						const nextFeature = allFeaturesSorted[feature.position + 1]
						const prevRect = elementRegistry[prevFeature?.id ?? (`` as Id)]?.parentElement?.getBoundingClientRect() ?? {
							right: -Infinity,
						}
						const nextRect = elementRegistry[nextFeature?.id ?? (`` as Id)]?.parentElement?.getBoundingClientRect() ?? {
							left: Infinity,
						}

						if (featureRect)
							allFeatureBounds.push({
								left: prevRect.right,
								right: avg(featureRect.right, nextRect.left),
								id: feature.id,
							})
					}
					allFeatureBounds.at(-1)!.right = Infinity

					const hoveringFeatureId = allFeatureBounds.find((feature) => x >= feature.left && x <= feature.right)?.id
					const storyBeingDragged = meta.stories.find((story) => story.id === dragInfo.itemBeingDraggedId)!
					if (!hoveringFeatureId || hoveringFeatureId === storyBeingDragged.parentId) return

					const data: {[key: `items.${string}.parentId`]: Id} = {
						[`items.${dragInfo.itemBeingDraggedId}.parentId`]: hoveringFeatureId,
					}
					operationCompleteCondition.current = (storyMapState) => {
						const item = storyMapState.items[storyBeingDragged.id]
						if (item?.type !== `story`) return false
						return item.parentId === hoveringFeatureId
					}
					await updateDoc(storyMapState.ref, data)
				} else {
					// Story to feature
					const allFeatureBounds: Array<{id: Id; left: number; right: number}> = []
					for (const epic of meta.epics) {
						for (const featureId of epic.childrenIds) {
							const featureRect = elementRegistry[featureId]?.parentElement?.getBoundingClientRect()
							const prevRect = allFeatureBounds.at(-1) ?? {right: -Infinity}
							if (featureRect)
								allFeatureBounds.push({
									left: prevRect.right,
									right: featureRect.left + featureRect.width / 2,
									id: featureId,
								})
						}
						const prevRect = allFeatureBounds.at(-1) ?? {right: -Infinity}
						const epicRect = elementRegistry[epic.id]?.parentElement?.getBoundingClientRect()
						if (epicRect) allFeatureBounds.push({left: prevRect.right, right: epicRect.right, id: epic.id})
					}
					allFeatureBounds.at(-1)!.right = Infinity

					const itemId = allFeatureBounds.find((bound) => x >= bound.left && x <= bound.right)!.id
					let parentId: Id
					let featureIndex: number
					if (storyMapState.items[itemId]!.type === `epic`) {
						parentId = itemId
						const epic = meta.epics.find((epic) => epic.id === itemId)!
						featureIndex = epic.childrenIds.length
					} else {
						const feature = meta.features.find((feature) => feature.id === itemId)!
						parentId = feature.parentId
						featureIndex = feature.position
					}
					if (parentId === dragInfo.itemBeingDraggedId) return

					const parent = meta.epics.find((epic) => epic.id === parentId)!
					const prevFeatureUserValue =
						meta.features.find((feature) => feature.id === parent.childrenIds[featureIndex - 1])?.userValue ?? 0
					const nextFeatureUserValue =
						meta.features.find((feature) => feature.id === parent.childrenIds[featureIndex])?.userValue ?? 1

					const itemBeingDragged = storyMapState.items[dragInfo.itemBeingDraggedId] as StoryType
					const data: {[key: `items.${Id}.`]: FeatureType} = {
						[`items.${dragInfo.itemBeingDraggedId}`]: {
							type: `feature` as const,
							description: itemBeingDragged.description,
							effort: 0.5,
							name: itemBeingDragged.name,
							userValue: avg(prevFeatureUserValue, nextFeatureUserValue),
							parentId,
						},
					}

					const id = dragInfo.itemBeingDraggedId
					operationCompleteCondition.current = (storyMapState) => {
						const item = storyMapState.items[id]
						return item?.type === `feature` && item.parentId === parentId
					}
					await updateDoc(storyMapState.ref, data)
				}
				break
			}
		}
	}

	const onPanEnd = () => {
		setDragInfo((prev) => ({
			...prev,
			itemBeingDraggedId: undefined,
		}))
	}

	return (
		<motion.div
			className="relative z-10 flex w-max items-start gap-8"
			onPanStart={onPanStart}
			onPan={() => {
				onPan().catch(console.error)
			}}
			onPanEnd={onPanEnd}
		>
			{meta.epics.map((epic) => (
				<Epic key={epic.id} meta={meta} dragInfo={dragInfo} epicId={epic.id} />
			))}

			<button
				type="button"
				onClick={() => {
					meta.addEpic({}).catch(console.error)
				}}
				className="flex items-center gap-2 rounded-md border border-dashed border-current bg-white px-2 py-1 text-[#4f2dc8] transition-colors hover:bg-[#faf8ff]"
				data-testid="add-epic"
			>
				<ReadOutlined />
				<span>Add epic</span>
			</button>

			<motion.div
				className="fixed top-0 left-0 z-20 cursor-grabbing"
				style={{
					x: useTransform(dragInfo.mousePos[0], (x) => x - dragInfo.offsetToTopLeft[0]),
					y: useTransform(dragInfo.mousePos[1], (y) => y - dragInfo.offsetToTopLeft[1]),
				}}
			>
				{(() => {
					const item = Object.entries(storyMapState.items).find(([id]) => id === dragInfo.itemBeingDraggedId)
					switch (item?.[1]!.type) {
						case `epic`:
							return <Epic meta={meta} dragInfo={dragInfo} epicId={item[0] as Id} inert />
						case `feature`:
							return <Feature meta={meta} dragInfo={dragInfo} featureId={item[0] as Id} inert />
						case `story`:
							return <Story meta={meta} dragInfo={dragInfo} storyId={item[0] as Id} inert />
					}
				})()}
			</motion.div>
		</motion.div>
	)
}

export default StoryMap
