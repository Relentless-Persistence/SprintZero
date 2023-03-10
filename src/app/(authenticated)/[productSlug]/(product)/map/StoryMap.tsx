import {ReadOutlined} from "@ant-design/icons"
import {Timestamp} from "firebase/firestore"
import {motion, useAnimationFrame, useMotionValue, useTransform} from "framer-motion"
import {useEffect, useRef, useState} from "react"

import type {DragInfo} from "./types"
import type {QuerySnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {StoryMapItem} from "~/types/db/Products/StoryMapItems"

import Epic from "./Epic"
import Feature from "./Feature"
import {elementRegistry, layerBoundaries} from "./globals"
import Story from "./Story"
import {useStoryMapContext} from "./StoryMapContext"
import {useAppContext} from "~/app/(authenticated)/AppContext"
import {avg} from "~/utils/math"
import {
	AllVersions,
	addEpic,
	deleteItem,
	getEpics,
	getFeatures,
	getItemType,
	getStories,
	getStoryMapShape,
	sortEpics,
	sortFeatures,
	sortStories,
	updateItem,
} from "~/utils/storyMap"

export type StoryMapProps = {
	onScroll: (amt: number) => void
}

const StoryMap: FC<StoryMapProps> = ({onScroll}) => {
	const {product, user} = useAppContext()
	const {storyMapItems, versions, editMode, currentVersionId, itemsToBeDeleted, setItemsToBeDeleted} =
		useStoryMapContext()

	const _stories = sortStories(
		getStories(storyMapItems).filter((story) => !itemsToBeDeleted.includes(story.id)),
		versions,
	)
	const stories = _stories.map((story) => {
		const siblings = sortStories(
			_stories.filter((sibling) => sibling.data().parentId === story.data().parentId),
			versions,
		)
		const position = siblings.findIndex((sibling) => sibling.id === story.id)

		return {
			...story.data(),
			id: story.id,
			position,
		}
	})
	const _features = sortFeatures(getFeatures(storyMapItems).filter((feature) => !itemsToBeDeleted.includes(feature.id)))
	const features = _features.map((feature) => {
		const siblings = _features.filter((sibling) => sibling.data().parentId === feature.data().parentId)
		const position = siblings.findIndex((sibling) => sibling.id === feature.id)

		return {
			...feature.data(),
			id: feature.id,
			childrenIds: _stories.filter((story) => story.data().parentId === feature.id).map((story) => story.id),
			position,
		}
	})
	const _epics = sortEpics(getEpics(storyMapItems).filter((epic) => !itemsToBeDeleted.includes(epic.id)))
	const epics = _epics.map((epic) => ({
		...epic.data(),
		id: epic.id,
		childrenIds: _features.filter((feature) => feature.data().parentId === epic.id).map((feature) => feature.id),
		position: _epics.findIndex((sibling) => sibling.id === epic.id),
	}))

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

	const pointerDownTarget = useRef<HTMLElement | null>(null)
	const onPanStart = () => {
		const registryEntry = Object.entries(elementRegistry).find(([, element]) =>
			element.content?.contains(pointerDownTarget.current),
		)
		const id = registryEntry?.[0]
		const element = registryEntry?.[1]?.content
		const contentBox = registryEntry?.[1]?.content?.getBoundingClientRect()
		if (!id || !element || !contentBox) return

		setDragInfo((prev) => ({
			...prev,
			itemBeingDraggedId: id,
			offsetToTopLeft: [prev.mousePos[0].get() - contentBox.left, prev.mousePos[1].get() - contentBox.top],
			offsetToMiddle: [
				contentBox.left + element.offsetWidth / 2 - prev.mousePos[0].get(),
				contentBox.top + element.offsetHeight / 2 - prev.mousePos[1].get(),
			],
		}))
	}

	// When I send an update to the server, I want to wait until the operation is complete before allowing drag events to
	// be processed again.
	const operationCompleteCondition = useRef<((storyMapItems: QuerySnapshot<StoryMapItem>) => boolean) | undefined>(
		undefined,
	)
	const onPan = async () => {
		if (dragInfo.itemBeingDraggedId === undefined || !product.exists()) return

		if (operationCompleteCondition.current) {
			const isOperationComplete = operationCompleteCondition.current(storyMapItems)
			if (isOperationComplete) operationCompleteCondition.current = undefined
			else return
		}

		const x = dragInfo.mousePos[0].get() + dragInfo.offsetToMiddle[0]
		const y = dragInfo.mousePos[1].get()

		// All the logic for moving items around are in this switch statement
		switch (getItemType(storyMapItems, dragInfo.itemBeingDraggedId)) {
			case `epic`: {
				const itemBeingDragged = epics.find((epic) => epic.id === dragInfo.itemBeingDraggedId)!
				if (y <= layerBoundaries[0]) {
					// === Reorder epics ===

					const currentEpic = epics.find((epic) => epic.id === itemBeingDragged.id)!
					const currentEpicBox = elementRegistry[currentEpic.id]?.container?.getBoundingClientRect()
					const prevEpic = epics.find((epic) => epic.position === currentEpic.position - 1)
					const nextEpic = epics.find((epic) => epic.position === currentEpic.position + 1)
					const prevEpicBox = elementRegistry[prevEpic?.id ?? ``]?.container?.getBoundingClientRect()
					const nextEpicBox = elementRegistry[nextEpic?.id ?? ``]?.container?.getBoundingClientRect()

					const boundaryLeft = prevEpicBox && currentEpicBox ? avg(prevEpicBox.left, currentEpicBox.right) : -Infinity
					const boundaryRight = currentEpicBox && nextEpicBox ? avg(currentEpicBox.left, nextEpicBox.right) : Infinity

					if (x < boundaryLeft) {
						operationCompleteCondition.current = (storyMapItems) => {
							const storyMapShape = getStoryMapShape(storyMapItems, versions)
							const currentEpicNewPos = storyMapShape.findIndex((epic) => epic.id === currentEpic.id)
							const prevEpicNewPos = storyMapShape.findIndex((epic) => epic.id === prevEpic!.id)
							return currentEpicNewPos < prevEpicNewPos
						}
						await Promise.all([
							updateItem(product, storyMapItems, versions, prevEpic!.id, {userValue: currentEpic.userValue}),
							updateItem(product, storyMapItems, versions, currentEpic.id, {userValue: prevEpic!.userValue}),
						])
					} else if (x > boundaryRight) {
						operationCompleteCondition.current = (storyMapItems) => {
							const storyMapShape = getStoryMapShape(storyMapItems, versions)
							const currentEpicNewPos = storyMapShape.findIndex((epic) => epic.id === currentEpic.id)
							const nextEpicNewPos = storyMapShape.findIndex((epic) => epic.id === nextEpic!.id)
							return currentEpicNewPos > nextEpicNewPos
						}
						await Promise.all([
							updateItem(product, storyMapItems, versions, nextEpic!.id, {userValue: currentEpic.userValue}),
							updateItem(product, storyMapItems, versions, currentEpic.id, {userValue: nextEpic!.userValue}),
						])
					}
				} else {
					// === Epic to feature ===

					/*              ||                       Epic 1                        ||                  Epic 2                   ||
					 * --------------------------------------------------------------------------------------------------------------------------------
					 * <- -Infinity ||   Feature 1   |              Feature 2              ||                 Feature 3                 || +Infinity ->
					 * | Boundary, Feature 1 |   Boundary, Feature 2    | Boundary, Epic 1 || Boundary, Feature 3 |         Boundary, Epic 2          |
					 */
					const allFeatureBounds: Array<{id: string; left: number; right: number}> = []
					for (const epic of epics) {
						for (const featureId of epic.childrenIds) {
							const featureRect = elementRegistry[featureId]?.container?.getBoundingClientRect()
							const prevRect = allFeatureBounds.at(-1) ?? {right: -Infinity}
							if (featureRect)
								allFeatureBounds.push({
									left: prevRect.right,
									right: featureRect.left + featureRect.width / 2,
									id: featureId,
								})
						}
						const prevRect = allFeatureBounds.at(-1) ?? {right: -Infinity}
						const epicRect = elementRegistry[epic.id]?.container?.getBoundingClientRect()
						if (epicRect) allFeatureBounds.push({id: epic.id, left: prevRect.right, right: epicRect.right})
					}
					allFeatureBounds.at(-1)!.right = Infinity

					const boundaryItemId = allFeatureBounds.find((bound) => x >= bound.left && x <= bound.right)!.id
					let boundaryItemParentId: string
					let newFeatureIndex: number
					if (getItemType(storyMapItems, boundaryItemId) === `epic`) {
						boundaryItemParentId = boundaryItemId
						const epic = epics.find((epic) => epic.id === boundaryItemId)!
						newFeatureIndex = epic.childrenIds.length
					} else {
						const feature = features.find((feature) => feature.id === boundaryItemId)!
						boundaryItemParentId = feature.parentId!
						newFeatureIndex = feature.position
					}
					if (boundaryItemParentId === dragInfo.itemBeingDraggedId) return

					const parent = epics.find((epic) => epic.id === boundaryItemParentId)!
					const prevFeatureUserValue =
						features.find((feature) => feature.id === parent.childrenIds[newFeatureIndex - 1])?.userValue ?? 0
					const nextFeatureUserValue =
						features.find((feature) => feature.id === parent.childrenIds[newFeatureIndex])?.userValue ?? 1

					operationCompleteCondition.current = (storyMapItems) => {
						const item = storyMapItems.docs.find((item) => item.id === itemBeingDragged.id)
						return (
							getItemType(storyMapItems, itemBeingDragged.id) === `feature` &&
							item?.data().parentId === boundaryItemParentId
						)
					}
					await Promise.all([
						updateItem(product, storyMapItems, versions, itemBeingDragged.id, {
							effort: 0.5,
							userValue: avg(prevFeatureUserValue, nextFeatureUserValue),
							parentId: boundaryItemParentId,
						}),
						// Delete child features, keep grandchild stories
						...itemBeingDragged.childrenIds.map((featureId) => deleteItem(product, storyMapItems, versions, featureId)),
						...itemBeingDragged.childrenIds.flatMap((featureId) =>
							stories
								.filter((story) => story.parentId === featureId)
								.map((story) =>
									updateItem(product, storyMapItems, versions, story.id, {parentId: itemBeingDragged.id}),
								),
						),
					])
				}
				break
			}
			case `feature`: {
				const itemBeingDragged = features.find((item) => item.id === dragInfo.itemBeingDraggedId)!
				if (y <= layerBoundaries[0]) {
					// === Feature to epic ===

					/* <- -Infinity |  Epic 1   |          Epic 2          | +Infinity ->
					 * | Boundary, Epic 1 | Boundary, Epic 2 |      Boundary, end       |
					 */
					const allEpicBounds: Array<{id: string; left: number; right: number}> = []
					for (const epic of epics) {
						const epicRect = elementRegistry[epic.id]?.container?.getBoundingClientRect()
						const prevRect = allEpicBounds.at(-1) ?? {right: -Infinity}
						if (epicRect)
							allEpicBounds.push({
								id: epic.id,
								left: prevRect.right,
								right: epicRect.left + epicRect.width / 2,
							})
					}
					allEpicBounds.push({id: `end`, left: allEpicBounds.at(-1)!.right, right: Infinity})

					const targetEpicId = allEpicBounds.find((bound) => x >= bound.left && x <= bound.right)!.id
					const targetEpicIndex =
						targetEpicId === `end` ? epics.length : epics.findIndex((epic) => epic.id === targetEpicId)
					const prevEpicUserValue = epics[targetEpicIndex - 1]?.userValue ?? 0
					const nextEpicUserValue = epics[targetEpicIndex]?.userValue ?? 1

					operationCompleteCondition.current = (storyMapItems) => {
						return getItemType(storyMapItems, itemBeingDragged.id) === `epic`
					}
					await Promise.all([
						updateItem(product, storyMapItems, versions, itemBeingDragged.id, {
							...itemBeingDragged,
							effort: 0.5,
							userValue: avg(prevEpicUserValue, nextEpicUserValue),
							keeperIds: itemBeingDragged.keeperIds,
							parentId: null,
						}),
						// Move child stories to feature level
						...itemBeingDragged.childrenIds.map((storyId, i) =>
							updateItem(product, storyMapItems, versions, storyId, {
								effort: 0.5,
								userValue: (i + 1) / (itemBeingDragged.childrenIds.length + 1),
								parentId: itemBeingDragged.id,
							}),
						),
					])
				} else if (y <= layerBoundaries[1]) {
					// === Reorder features ===

					const currentFeature = itemBeingDragged
					const currentFeatureRect = elementRegistry[currentFeature.id]?.container?.getBoundingClientRect()
					const parentRect = elementRegistry[currentFeature.parentId!]?.container?.getBoundingClientRect()

					if (!parentRect || !currentFeatureRect) return
					if (x < parentRect.left || x > parentRect.right) {
						// Move to another epic

						const currentParent = epics.find((epic) => epic.id === currentFeature.parentId)!
						const newParent =
							x < parentRect.left ? epics[currentParent.position - 1] : epics[currentParent.position + 1]
						const newParentRect = elementRegistry[newParent?.id ?? ``]?.container?.getBoundingClientRect()
						if (!newParent || !newParentRect) return
						const siblings = sortFeatures(
							storyMapItems.docs.filter(
								(item) => item.data().parentId === newParent.id && item.data().deleted === false,
							),
						)

						if (x < parentRect.left) {
							// Move to epic on the left

							const prevFeature = siblings.at(-1)
							const prevFeatureRect = elementRegistry[prevFeature?.id ?? ``]?.container?.getBoundingClientRect()
							const boundary = avg(
								prevFeatureRect
									? prevFeatureRect.left + prevFeatureRect.width / 2
									: newParentRect.left + newParentRect.width / 2,
								currentFeatureRect.left + currentFeatureRect.width / 2,
							)
							if (x > boundary) return
							const prevFeatureUserValue = siblings.at(-1)?.data().userValue ?? 0
							operationCompleteCondition.current = (storyMapItems) => {
								const item = storyMapItems.docs.find((item) => item.id === itemBeingDragged.id)
								return (
									getItemType(storyMapItems, itemBeingDragged.id) === `feature` &&
									item?.data().parentId === newParent.id
								)
							}
							await updateItem(product, storyMapItems, versions, dragInfo.itemBeingDraggedId, {
								effort: 0.5,
								userValue: avg(prevFeatureUserValue, 1),
								parentId: newParent.id,
							})
						} else {
							// Move to epic on the right

							const nextFeature = siblings[currentFeature.position]
							const nextFeatureRect = elementRegistry[nextFeature?.id ?? ``]?.container?.getBoundingClientRect()
							const boundary = avg(
								currentFeatureRect.right + currentFeatureRect.width / 2,
								nextFeatureRect
									? nextFeatureRect.left + nextFeatureRect.width / 2
									: newParentRect.left + newParentRect.width / 2,
							)
							if (x < boundary) return
							const nextFeatureUserValue = siblings[currentFeature.position]?.data().userValue ?? 1
							operationCompleteCondition.current = (storyMapItems) => {
								const item = storyMapItems.docs.find((item) => item.id === itemBeingDragged.id)!
								return getItemType(storyMapItems, item.id) === `feature` && item.data().parentId === newParent.id
							}
							await updateItem(product, storyMapItems, versions, dragInfo.itemBeingDraggedId, {
								effort: 0.5,
								userValue: avg(nextFeatureUserValue, 0),
								parentId: newParent.id,
							})
						}
					} else {
						// Reorder within epic
						const siblings = sortFeatures(
							storyMapItems.docs.filter((item) => item.data().parentId === currentFeature.parentId),
						)
						const prevFeature = siblings[currentFeature.position - 1]
						const nextFeature = siblings[currentFeature.position + 1]
						const currentFeatureRect = elementRegistry[dragInfo.itemBeingDraggedId]?.container?.getBoundingClientRect()
						const prevFeatureRect =
							elementRegistry[siblings[currentFeature.position - 1]?.id ?? ``]?.container?.getBoundingClientRect()
						const nextFeatureRect =
							elementRegistry[siblings[currentFeature.position + 1]?.id ?? ``]?.container?.getBoundingClientRect()

						const leftBoundary =
							currentFeatureRect && prevFeatureRect ? avg(prevFeatureRect.left, currentFeatureRect.right) : -Infinity
						const rightBoundary =
							currentFeatureRect && nextFeatureRect ? avg(currentFeatureRect.left, nextFeatureRect.right) : Infinity

						if (x < leftBoundary) {
							operationCompleteCondition.current = (storyMapItems) => {
								const item = storyMapItems.docs.find((item) => item.id === currentFeature.id)
								if (getItemType(storyMapItems, currentFeature.id) !== `feature`) return false
								return item?.data().userValue === prevFeature?.data().userValue
							}
							await Promise.all([
								updateItem(product, storyMapItems, versions, prevFeature!.id, {userValue: currentFeature.userValue}),
								updateItem(product, storyMapItems, versions, currentFeature.id, {
									userValue: prevFeature!.data().userValue,
								}),
							])
						} else if (x > rightBoundary) {
							operationCompleteCondition.current = (storyMapItems) => {
								const item = storyMapItems.docs.find((item) => item.id === currentFeature.id)
								if (getItemType(storyMapItems, currentFeature.id) !== `feature`) return false
								return item!.data().userValue === nextFeature!.data().userValue
							}
							await Promise.all([
								updateItem(product, storyMapItems, versions, nextFeature!.id, {userValue: currentFeature.userValue}),
								updateItem(product, storyMapItems, versions, currentFeature.id, {
									userValue: nextFeature!.data().userValue,
								}),
							])
						}
					}
				} else {
					// Feature to story
					const allFeaturesSorted = features.sort((a, b) => {
						const aParent = epics.find((epic) => epic.id === a.parentId)!
						const bParent = epics.find((epic) => epic.id === b.parentId)!
						return aParent.position - bParent.position || a.position - b.position
					})
					const allFeatureBounds: Array<{id: string; left: number; right: number}> = []
					for (const feature of allFeaturesSorted) {
						const featureRect = elementRegistry[feature.id]?.container?.getBoundingClientRect()
						const prevFeature = allFeaturesSorted[feature.position - 1]
						const nextFeature = allFeaturesSorted[feature.position + 1]
						const prevRect = elementRegistry[prevFeature?.id ?? ``]?.container?.getBoundingClientRect() ?? {
							right: -Infinity,
						}
						const nextRect = elementRegistry[nextFeature?.id ?? ``]?.container?.getBoundingClientRect() ?? {
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
					const hoveringFeature = features.find((feature) => feature.id === hoveringFeatureId)
					if (
						!hoveringFeature ||
						hoveringFeature.id === dragInfo.itemBeingDraggedId ||
						currentVersionId === AllVersions
					)
						return

					const featureBeingDragged = features.find((feature) => feature.id === dragInfo.itemBeingDraggedId)!
					operationCompleteCondition.current = (storyMapItems) => {
						return getItemType(storyMapItems, featureBeingDragged.id) === `story`
					}
					await Promise.all([
						updateItem(product, storyMapItems, versions, dragInfo.itemBeingDraggedId, {
							...featureBeingDragged,
							createdAt: Timestamp.now(),
							updatedAt: Timestamp.now(),
							parentId: hoveringFeature.id,
							updatedAtUserId: user.id,
							versionId: featureBeingDragged.versionId ?? currentVersionId,
						}),
						// Delete all children
						...featureBeingDragged.childrenIds.map((childId) => deleteItem(product, storyMapItems, versions, childId)),
					])
				}
				break
			}
			case `story`: {
				const itemBeingDragged = stories.find((story) => story.id === dragInfo.itemBeingDraggedId)!
				if (y > layerBoundaries[1]) {
					// Move story between features
					const allFeaturesSorted = features.sort((a, b) => {
						const aParent = epics.find((epic) => epic.id === a.parentId)!
						const bParent = epics.find((epic) => epic.id === b.parentId)!
						return aParent.position - bParent.position || a.position - b.position
					})
					const allFeatureBounds: Array<{id: string; left: number; right: number}> = []
					for (const feature of allFeaturesSorted) {
						const featureRect = elementRegistry[feature.id]?.container?.getBoundingClientRect()
						const prevFeature = allFeaturesSorted[feature.position - 1]
						const nextFeature = allFeaturesSorted[feature.position + 1]
						const prevRect = elementRegistry[prevFeature?.id ?? ``]?.container?.getBoundingClientRect() ?? {
							right: -Infinity,
						}
						const nextRect = elementRegistry[nextFeature?.id ?? ``]?.container?.getBoundingClientRect() ?? {
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
					const storyBeingDragged = stories.find((story) => story.id === dragInfo.itemBeingDraggedId)!
					if (!hoveringFeatureId || hoveringFeatureId === storyBeingDragged.parentId) return

					operationCompleteCondition.current = (storyMapItems) => {
						const item = storyMapItems.docs.find((item) => item.id === storyBeingDragged.id)!
						if (getItemType(storyMapItems, storyBeingDragged.id) !== `story`) return false
						return item.data().parentId === hoveringFeatureId
					}
					await updateItem(product, storyMapItems, versions, dragInfo.itemBeingDraggedId, {parentId: hoveringFeatureId})
				} else {
					// Story to feature
					const allFeatureBounds: Array<{id: string; left: number; right: number}> = []
					for (const epic of epics) {
						for (const featureId of epic.childrenIds) {
							const featureRect = elementRegistry[featureId]?.container?.getBoundingClientRect()
							const prevRect = allFeatureBounds.at(-1) ?? {right: -Infinity}
							if (featureRect)
								allFeatureBounds.push({
									left: prevRect.right,
									right: featureRect.left + featureRect.width / 2,
									id: featureId,
								})
						}
						const prevRect = allFeatureBounds.at(-1) ?? {right: -Infinity}
						const epicRect = elementRegistry[epic.id]?.container?.getBoundingClientRect()
						if (epicRect) allFeatureBounds.push({left: prevRect.right, right: epicRect.right, id: epic.id})
					}
					allFeatureBounds.at(-1)!.right = Infinity

					const itemId = allFeatureBounds.find((bound) => x >= bound.left && x <= bound.right)!.id
					let parentId: string
					let featureIndex: number
					if (getItemType(storyMapItems, itemId) === `epic`) {
						parentId = itemId
						const epic = epics.find((epic) => epic.id === itemId)!
						featureIndex = epic.childrenIds.length
					} else {
						const feature = features.find((feature) => feature.id === itemId)!
						parentId = feature.parentId!
						featureIndex = feature.position
					}
					if (parentId === dragInfo.itemBeingDraggedId) return

					const parent = epics.find((epic) => epic.id === parentId)!
					const prevFeatureUserValue =
						features.find((feature) => feature.id === parent.childrenIds[featureIndex - 1])?.userValue ?? 0
					const nextFeatureUserValue =
						features.find((feature) => feature.id === parent.childrenIds[featureIndex])?.userValue ?? 1

					const id = dragInfo.itemBeingDraggedId
					operationCompleteCondition.current = (storyMapItems) => {
						const item = storyMapItems.docs.find((item) => item.id === id)
						return getItemType(storyMapItems, id) === `feature` && item?.data().parentId === parentId
					}

					await updateItem(product, storyMapItems, versions, dragInfo.itemBeingDraggedId, {
						...itemBeingDragged,
						effort: 0.5,
						userValue: avg(prevFeatureUserValue, nextFeatureUserValue),
						parentId,
					})
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

	useAnimationFrame(() => {
		if (!dragInfo.itemBeingDraggedId) return
		const x = dragInfo.mousePos[0].get()
		if (x < 248) onScroll(Math.max(-10, -(248 - x) / 10))
		else if (x > window.innerWidth - 144) onScroll(Math.min(10, (x - window.innerWidth + 144) / 10))
	})

	const surrogateParentPos = {
		x: useTransform(dragInfo.mousePos[0], (x) => x - dragInfo.offsetToTopLeft[0]),
		y: useTransform(dragInfo.mousePos[1], (y) => y - dragInfo.offsetToTopLeft[1]),
	}

	if (!product.exists()) return null
	return (
		<motion.div
			className="relative z-10 flex w-max items-start gap-8"
			onPointerDown={(e) => {
				pointerDownTarget.current = e.target as HTMLElement
			}}
			onPointerUp={() => {
				pointerDownTarget.current = null
			}}
			onPointerCancel={() => {
				pointerDownTarget.current = null
			}}
			onPanStart={() => {
				if (!editMode) onPanStart()
			}}
			onPan={() => {
				if (!editMode) onPan().catch(console.error)
			}}
			onPanEnd={onPanEnd}
		>
			{epics.map((epic) => (
				<Epic
					key={epic.id}
					epicId={epic.id}
					dragInfo={dragInfo}
					onMarkForDeletion={(id: string) => {
						setItemsToBeDeleted((prev) => [...prev, id])
					}}
				/>
			))}

			{!editMode && (
				<button
					type="button"
					onClick={() => {
						addEpic(product, storyMapItems, versions, {}, user.id).catch(console.error)
					}}
					className="flex items-center gap-2 rounded border border-dashed border-current bg-white px-2 py-1 font-medium text-[#4f2dc8] dark:bg-black dark:text-[#6b44f8]"
					data-testid="add-epic"
				>
					<ReadOutlined />
					<span className="my-1">Add epic</span>
				</button>
			)}

			{/* Surrogate parent for story map items as they're being dragged (the real item in the tree is made invisible) */}
			<motion.div className="fixed top-0 left-0 z-20 cursor-grabbing" style={surrogateParentPos}>
				{(() => {
					if (!dragInfo.itemBeingDraggedId) return null
					switch (getItemType(storyMapItems, dragInfo.itemBeingDraggedId)) {
						case `epic`:
							return (
								<Epic
									epicId={dragInfo.itemBeingDraggedId}
									dragInfo={dragInfo}
									onMarkForDeletion={(id: string) => {
										setItemsToBeDeleted((prev) => [...prev, id])
									}}
									inert
								/>
							)
						case `feature`:
							return (
								<Feature
									featureId={dragInfo.itemBeingDraggedId}
									dragInfo={dragInfo}
									onMarkForDeletion={(id: string) => {
										setItemsToBeDeleted((prev) => [...prev, id])
									}}
									inert
								/>
							)
						case `story`:
							return (
								<Story
									storyId={dragInfo.itemBeingDraggedId}
									dragInfo={dragInfo}
									onMarkForDeletion={() => {
										setItemsToBeDeleted((prev) => [...prev, dragInfo.itemBeingDraggedId!])
									}}
									inert
								/>
							)
					}
				})()}
			</motion.div>
		</motion.div>
	)
}

export default StoryMap
