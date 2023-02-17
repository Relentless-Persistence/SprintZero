import {CopyOutlined, FileOutlined, PlusOutlined, ReadOutlined} from "@ant-design/icons"
import clsx from "clsx"
import {Timestamp, serverTimestamp} from "firebase/firestore"
import {motion, useMotionValue, useTransform} from "framer-motion"
import {useEffect, useRef, useState} from "react"

import type {DragInfo} from "./types"
import type {QueryDocumentSnapshot, QuerySnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {Id} from "~/types"
import type {StoryMapState, Story as StoryType} from "~/types/db/StoryMapStates"
import type {Version} from "~/types/db/Versions"

import Epic from "./Epic"
import Feature from "./Feature"
import {elementRegistry, layerBoundaries} from "./globals"
import {useGenMeta} from "./meta"
import Story from "./Story"
import {avg} from "~/utils/math"
import {addEpic, addFeature, addStory, deleteItem, sortFeatures, updateItem} from "~/utils/storyMap"

export type StoryMapProps = {
	storyMapState: QueryDocumentSnapshot<StoryMapState>
	allVersions: QuerySnapshot<Version>
	currentVersionId: Id | `__ALL_VERSIONS__`
}

const StoryMap: FC<StoryMapProps> = ({storyMapState, allVersions, currentVersionId}) => {
	const meta = useGenMeta({
		storyMapState,
		allVersions,
		currentVersionId,
	})

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

	// When I send an update to the server, I want to wait until the operation is complete before allowing drag events to
	// be processed again.
	const operationCompleteCondition = useRef<((storyMapItems: StoryMapState[`items`]) => boolean) | undefined>(undefined)
	const onPan = async () => {
		if (dragInfo.itemBeingDraggedId === undefined) return

		if (operationCompleteCondition.current) {
			const isOperationComplete = operationCompleteCondition.current(storyMapState.data().items)
			if (isOperationComplete) operationCompleteCondition.current = undefined
			else return
		}

		const x = dragInfo.mousePos[0].get() + dragInfo.offsetToMiddle[0]
		const y = dragInfo.mousePos[1].get()

		// All the logic for moving items around are in this switch statement
		switch (storyMapState.data().items[dragInfo.itemBeingDraggedId]!.type) {
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
						operationCompleteCondition.current = (storyMapItems) => {
							const item = storyMapItems[currentEpic!.id]
							if (item?.type !== `epic`) return false
							return item.userValue === prevEpic!.userValue
						}
						await Promise.all([
							updateItem(storyMapState, prevEpic!.id, {userValue: currentEpic!.userValue}, allVersions),
							updateItem(storyMapState, currentEpic!.id, {userValue: prevEpic!.userValue}, allVersions),
						])
					} else if (x > boundaryRight) {
						operationCompleteCondition.current = (storyMapItems) => {
							const item = storyMapItems[currentEpic!.id]
							if (item?.type !== `epic`) return false
							return item.userValue === nextEpic!.userValue
						}
						await Promise.all([
							updateItem(storyMapState, nextEpic!.id, {userValue: currentEpic!.userValue}, allVersions),
							updateItem(storyMapState, currentEpic!.id, {userValue: nextEpic!.userValue}, allVersions),
						])
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
					if (storyMapState.data().items[itemId]!.type === `epic`) {
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

					const itemBeingDragged = meta.epics.find((epic) => epic.id === dragInfo.itemBeingDraggedId)!

					const id = dragInfo.itemBeingDraggedId
					operationCompleteCondition.current = (storyMapItems) => {
						const item = storyMapItems[id]
						return item?.type === `feature` && item.parentId === parentId
					}

					await Promise.all([
						updateItem(
							storyMapState,
							dragInfo.itemBeingDraggedId,
							{
								type: `feature` as const,
								effort: 0.5,
								userValue: avg(prevFeatureUserValue, nextFeatureUserValue),
								parentId,
							},
							allVersions,
						),
						// Delete child features, keep grandchild stories
						...itemBeingDragged.childrenIds.map((featureId) => deleteItem(storyMapState, featureId)),
						...itemBeingDragged.childrenIds.flatMap((featureId) =>
							meta.stories
								.filter((story) => story.parentId === featureId)
								.map((story) => updateItem(storyMapState, story.id, {parentId: id}, allVersions)),
						),
					])
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
					const id = dragInfo.itemBeingDraggedId
					operationCompleteCondition.current = (storyMapItems) => {
						const item = storyMapItems[id]
						return item?.type === `epic`
					}

					await Promise.all([
						updateItem(
							storyMapState,
							dragInfo.itemBeingDraggedId,
							{
								...itemBeingDragged,
								type: `epic` as const,
								effort: 0.5,
								userValue: avg(prevEpicUserValue, nextEpicUserValue),
								keeperIds: itemBeingDragged.keeperIds ?? [],
							},
							allVersions,
						),
						// Move child stories to feature level
						...itemBeingDragged.childrenIds.map((storyId, i) =>
							updateItem(
								storyMapState,
								storyId,
								{
									type: `feature` as const,
									effort: 0.5,
									userValue: (i + 1) / (itemBeingDragged.childrenIds.length + 1),
									parentId: id,
								},
								allVersions,
							),
						),
					])
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
							const id = dragInfo.itemBeingDraggedId
							operationCompleteCondition.current = (storyMapItems) => {
								const item = storyMapItems[id]
								return item?.type === `feature` && item.parentId === newParent.id
							}
							await updateItem(
								storyMapState,
								dragInfo.itemBeingDraggedId,
								{
									effort: 0.5,
									userValue: avg(prevFeatureUserValue, 1),
									parentId: newParent.id,
								},
								allVersions,
							)
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
							const id = dragInfo.itemBeingDraggedId
							operationCompleteCondition.current = (storyMapItems) => {
								const item = storyMapItems[id]
								return item?.type === `feature` && item.parentId === newParent.id
							}
							await updateItem(
								storyMapState,
								dragInfo.itemBeingDraggedId,
								{
									effort: 0.5,
									userValue: avg(nextFeatureUserValue, 0),
									parentId: newParent.id,
								},
								allVersions,
							)
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
							operationCompleteCondition.current = (storyMapItems) => {
								const item = storyMapItems[currentFeature.id]
								if (item?.type !== `feature`) return false
								return item.userValue === prevFeature!.userValue
							}
							await Promise.all([
								updateItem(storyMapState, prevFeature!.id, {userValue: currentFeature.userValue}, allVersions),
								updateItem(storyMapState, currentFeature.id, {userValue: prevFeature!.userValue}, allVersions),
							])
						} else if (x > rightBoundary) {
							operationCompleteCondition.current = (storyMapItems) => {
								const item = storyMapItems[currentFeature.id]
								if (item?.type !== `feature`) return false
								return item.userValue === nextFeature!.userValue
							}
							await Promise.all([
								updateItem(storyMapState, nextFeature!.id, {userValue: currentFeature.userValue}, allVersions),
								updateItem(storyMapState, currentFeature.id, {userValue: nextFeature!.userValue}, allVersions),
							])
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
					operationCompleteCondition.current = (storyMapItems) => {
						const item = storyMapItems[featureBeingDragged.id]
						return item?.type === `story`
					}
					await Promise.all([
						updateItem(
							storyMapState,
							dragInfo.itemBeingDraggedId,
							{
								...featureBeingDragged,
								type: `story` as const,
								acceptanceCriteria: featureBeingDragged.acceptanceCriteria ?? [],
								branchName: featureBeingDragged.branchName,
								bugs: featureBeingDragged.bugs ?? [],
								createdAt: Timestamp.now(),
								designLink: featureBeingDragged.designLink,
								ethicsApproved: featureBeingDragged.ethicsApproved,
								ethicsColumn: featureBeingDragged.ethicsColumn,
								ethicsVotes: featureBeingDragged.ethicsVotes ?? [],
								pageLink: featureBeingDragged.pageLink,
								points: featureBeingDragged.points ?? 0,
								sprintColumn: featureBeingDragged.sprintColumn ?? (`productBacklog` as const),
								updatedAt: serverTimestamp(),
								parentId: hoveringFeature.id,
								versionId: featureBeingDragged.versionId ?? currentVersionId,
							},
							allVersions,
						),
						// Delete all children
						...featureBeingDragged.childrenIds.map((childId) => deleteItem(storyMapState, childId)),
					])
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

					operationCompleteCondition.current = (storyMapItems) => {
						const item = storyMapItems[storyBeingDragged.id]
						if (item?.type !== `story`) return false
						return item.parentId === hoveringFeatureId
					}
					await updateItem(storyMapState, dragInfo.itemBeingDraggedId, {parentId: hoveringFeatureId}, allVersions)
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
					if (storyMapState.data().items[itemId]!.type === `epic`) {
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

					const itemBeingDragged = storyMapState.data().items[dragInfo.itemBeingDraggedId] as StoryType

					const id = dragInfo.itemBeingDraggedId
					operationCompleteCondition.current = (storyMapItems) => {
						const item = storyMapItems[id]
						return item?.type === `feature` && item.parentId === parentId
					}

					await updateItem(
						storyMapState,
						dragInfo.itemBeingDraggedId,
						{
							...itemBeingDragged,
							type: `feature` as const,
							effort: 0.5,
							userValue: avg(prevFeatureUserValue, nextFeatureUserValue),
							parentId,
						},
						allVersions,
					)
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
				<div
					key={epic.id}
					className={clsx(`grid justify-items-center gap-x-6`, dragInfo.itemBeingDraggedId === epic.id && `invisible`)}
					style={{gridTemplateColumns: `repeat(${epic.childrenIds.length}, auto)`}}
				>
					<Epic meta={meta} epicId={epic.id} />

					{/* Pad out the remaining columns in row 1 */}
					{Array(Math.max(epic.childrenIds.length - 1, 0))
						.fill(undefined)
						.map((_, i) => (
							<div key={`row1-${i}`} />
						))}

					{/* Pad out the beginning columns in row 2 */}
					{Array(Math.max(epic.childrenIds.length, 1))
						.fill(undefined)
						.map((_, i) => (
							<div key={`row2-${i}`} className="relative h-16 w-[calc(100%+1.5rem)]">
								{/* Top */}
								{i === 0 && (
									<div className="absolute left-1/2 top-0 h-1/2 w-px -translate-x-1/2 border border-[#d0d0d0]" />
								)}
								{/* Right */}
								{i < epic.childrenIds.length - 1 && (
									<div className="absolute left-1/2 top-1/2 h-px w-1/2 -translate-y-1/2 border border-[#d0d0d0]" />
								)}
								{/* Bottom */}
								<div className="absolute left-1/2 top-1/2 h-1/2 w-px -translate-x-1/2 border border-[#d0d0d0]" />
								{/* Left */}
								{i > 0 && (
									<div className="absolute left-0 top-1/2 h-px w-1/2 -translate-y-1/2 border border-[#d0d0d0]" />
								)}

								{i === epic.childrenIds.length - 1 && epic.childrenIds.length > 0 && (
									<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
										<button
											type="button"
											onClick={() => {
												addFeature(storyMapState, {parentId: epic.id}).catch(console.error)
											}}
											className="grid h-4 w-4 place-items-center rounded-full bg-green text-[0.6rem] text-white"
										>
											<PlusOutlined />
										</button>
									</div>
								)}
							</div>
						))}

					{epic.childrenIds
						.map((id) => meta.features.find((feature) => id === feature.id)!)
						.map((feature) => {
							const stories = feature.childrenIds
								.map((id) => meta.stories.find((story) => story.id === id)!)
								.filter((story) => {
									if (meta.currentVersionId === `__ALL_VERSIONS__`) return true
									return story.versionId === meta.currentVersionId
								})

							return (
								<div
									key={feature.id}
									className={clsx(
										`flex flex-col items-center`,
										dragInfo.itemBeingDraggedId === feature.id && `invisible`,
									)}
								>
									<Feature meta={meta} featureId={feature.id} />

									{(meta.currentVersionId !== `__ALL_VERSIONS__` || feature.childrenIds.length > 0) && (
										<div className="h-8 w-px border border-[#d0d0d0]" />
									)}

									{stories.length === 0 && meta.currentVersionId !== `__ALL_VERSIONS__` && (
										<button
											type="button"
											onClick={() => {
												if (meta.currentVersionId !== `__ALL_VERSIONS__`)
													addStory(storyMapState, currentVersionId, {parentId: feature.id}).catch(console.error)
											}}
											className="flex items-center gap-2 rounded border border-dashed border-current bg-white px-2 py-1 font-medium text-[#103001]"
										>
											<FileOutlined />
											<span>Add story</span>
										</button>
									)}

									{stories.length > 0 && (
										<div className="flex flex-col items-start gap-3 rounded-lg border border-[#0273b3] bg-[#f0f2f5] p-3">
											{stories.map((story) => (
												<div key={story.id} className={clsx(dragInfo.itemBeingDraggedId === story.id && `invisible`)}>
													<Story meta={meta} storyId={story.id} />
												</div>
											))}

											{meta.currentVersionId !== `__ALL_VERSIONS__` && (
												<button
													type="button"
													onClick={() => {
														if (meta.currentVersionId !== `__ALL_VERSIONS__`)
															addStory(storyMapState, currentVersionId, {parentId: feature.id}).catch(console.error)
													}}
													className="flex w-full items-center justify-center gap-2 rounded border border-dashed border-[currentColor] bg-white px-2 py-1 font-medium text-[#103001]"
												>
													<FileOutlined />
													<span>Add story</span>
												</button>
											)}
										</div>
									)}
								</div>
							)
						})}

					{epic.childrenIds.length === 0 && (
						<button
							type="button"
							onClick={() => {
								addFeature(storyMapState, {parentId: epic.id}).catch(console.error)
							}}
							className="flex items-center gap-2 rounded border border-dashed border-current bg-white px-2 py-1 font-medium text-[#006378]"
						>
							<CopyOutlined />
							<span>Add feature</span>
						</button>
					)}
				</div>
			))}

			<button
				type="button"
				onClick={() => {
					addEpic(storyMapState, {}).catch(console.error)
				}}
				className="flex items-center gap-2 rounded border border-dashed border-current bg-white px-2 py-1 font-medium text-[#4f2dc8]"
				data-testid="add-epic"
			>
				<ReadOutlined />
				<span>Add epic</span>
			</button>

			{/* Surrogate parent for story map items as they're being dragged (the real item in the tree is made invisible) */}
			<motion.div
				className="fixed top-0 left-0 z-20 cursor-grabbing"
				style={{
					x: useTransform(dragInfo.mousePos[0], (x) => x - dragInfo.offsetToTopLeft[0]),
					y: useTransform(dragInfo.mousePos[1], (y) => y - dragInfo.offsetToTopLeft[1]),
				}}
			>
				{(() => {
					const item = Object.entries(storyMapState.data().items).find(([id]) => id === dragInfo.itemBeingDraggedId)
					switch (item?.[1]!.type) {
						case `epic`:
							return <Epic meta={meta} epicId={item[0] as Id} inert />
						case `feature`:
							return <Feature meta={meta} featureId={item[0] as Id} inert />
						case `story`:
							return <Story meta={meta} storyId={item[0] as Id} inert />
					}
				})()}
			</motion.div>
		</motion.div>
	)
}

export default StoryMap
