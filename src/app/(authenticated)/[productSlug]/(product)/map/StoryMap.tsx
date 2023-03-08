import {CopyOutlined, FileOutlined, PlusOutlined, ReadOutlined} from "@ant-design/icons"
import clsx from "clsx"
import {Timestamp, collection, doc} from "firebase/firestore"
import {motion, useAnimationFrame, useMotionValue, useTransform} from "framer-motion"
import {useEffect, useRef, useState} from "react"
import {useCollection, useDocument} from "react-firebase-hooks/firestore"

import type {DragInfo} from "./types"
import type {QuerySnapshot} from "firebase/firestore"
import type {Dispatch, FC, SetStateAction} from "react"
import type {StoryMapItem} from "~/types/db/Products/StoryMapItems"
import type {Version} from "~/types/db/Products/Versions"

import Epic from "./Epic"
import Feature from "./Feature"
import {elementRegistry, layerBoundaries} from "./globals"
import Story from "./Story"
import {ProductConverter} from "~/types/db/Products"
import {VersionConverter} from "~/types/db/Products/Versions"
import {db} from "~/utils/firebase"
import {avg} from "~/utils/math"
import {
	AllVersions,
	addEpic,
	addFeature,
	addStory,
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
import {useActiveProductId} from "~/utils/useActiveProductId"
import {useUser} from "~/utils/useUser"

export type StoryMapProps = {
	storyMapItems: QuerySnapshot<StoryMapItem>
	allVersions: QuerySnapshot<Version>
	currentVersionId: string | typeof AllVersions
	editMode: boolean
	itemsToBeDeleted: string[]
	setItemsToBeDeleted: Dispatch<SetStateAction<string[]>>
	onScroll: (amt: number) => void
}

const StoryMap: FC<StoryMapProps> = ({
	storyMapItems,
	allVersions,
	currentVersionId,
	editMode,
	itemsToBeDeleted,
	setItemsToBeDeleted,
	onScroll,
}) => {
	const user = useUser()

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
		const entry = Object.entries(elementRegistry).find(([, element]) => element?.contains(pointerDownTarget.current))
		if (!entry || !entry[1]) return
		const [id, element] = entry
		setDragInfo((prev) => ({
			...prev,
			itemBeingDraggedId: id,
			offsetToTopLeft: [
				prev.mousePos[0].get() - element.getBoundingClientRect().left,
				prev.mousePos[1].get() - element.getBoundingClientRect().top,
			],
			offsetToMiddle: [
				element.getBoundingClientRect().left + element.offsetWidth / 2 - prev.mousePos[0].get(),
				element.getBoundingClientRect().top + element.offsetHeight / 2 - prev.mousePos[1].get(),
			],
		}))
	}

	const activeProductId = useActiveProductId()
	const [product] = useDocument(doc(db, `Products`, activeProductId).withConverter(ProductConverter))
	const [versions] = useCollection(
		collection(db, `Products`, activeProductId, `Versions`).withConverter(VersionConverter),
	)

	const _stories = sortStories(
		getStories(storyMapItems).filter((story) => !itemsToBeDeleted.includes(story.id)),
		allVersions,
	)
	const stories = _stories.map((story) => {
		const siblings = sortStories(
			_stories.filter((sibling) => sibling.data().parentId === story.data().parentId),
			allVersions,
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

	// When I send an update to the server, I want to wait until the operation is complete before allowing drag events to
	// be processed again.
	const operationCompleteCondition = useRef<((storyMapItems: QuerySnapshot<StoryMapItem>) => boolean) | undefined>(
		undefined,
	)
	const onPan = async () => {
		if (dragInfo.itemBeingDraggedId === undefined || !product?.exists()) return

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
					const currentEpicBox = elementRegistry[currentEpic.id]?.parentElement!.getBoundingClientRect()
					const prevEpic = epics.find((epic) => epic.position === currentEpic.position - 1)
					const nextEpic = epics.find((epic) => epic.position === currentEpic.position + 1)
					const prevEpicBox = elementRegistry[prevEpic?.id ?? ``]?.parentElement!.getBoundingClientRect()
					const nextEpicBox = elementRegistry[nextEpic?.id ?? ``]?.parentElement!.getBoundingClientRect()

					const boundaryLeft = prevEpicBox && currentEpicBox ? avg(prevEpicBox.left, currentEpicBox.right) : -Infinity
					const boundaryRight = currentEpicBox && nextEpicBox ? avg(currentEpicBox.left, nextEpicBox.right) : Infinity

					if (x < boundaryLeft) {
						operationCompleteCondition.current = (storyMapItems) => {
							if (!versions) return false
							const storyMapShape = getStoryMapShape(storyMapItems, versions)
							const currentEpicNewPos = storyMapShape.findIndex((epic) => epic.id === currentEpic.id)
							const prevEpicNewPos = storyMapShape.findIndex((epic) => epic.id === prevEpic!.id)
							return currentEpicNewPos < prevEpicNewPos
						}
						await Promise.all([
							updateItem(product, storyMapItems, prevEpic!.id, {userValue: currentEpic.userValue}, allVersions),
							updateItem(product, storyMapItems, currentEpic.id, {userValue: prevEpic!.userValue}, allVersions),
						])
					} else if (x > boundaryRight) {
						operationCompleteCondition.current = (storyMapItems) => {
							if (!versions) return false
							const storyMapShape = getStoryMapShape(storyMapItems, versions)
							const currentEpicNewPos = storyMapShape.findIndex((epic) => epic.id === currentEpic.id)
							const nextEpicNewPos = storyMapShape.findIndex((epic) => epic.id === nextEpic!.id)
							return currentEpicNewPos > nextEpicNewPos
						}
						await Promise.all([
							updateItem(product, storyMapItems, nextEpic!.id, {userValue: currentEpic.userValue}, allVersions),
							updateItem(product, storyMapItems, currentEpic.id, {userValue: nextEpic!.userValue}, allVersions),
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
						updateItem(
							product,
							storyMapItems,
							itemBeingDragged.id,
							{
								effort: 0.5,
								userValue: avg(prevFeatureUserValue, nextFeatureUserValue),
								parentId: boundaryItemParentId,
							},
							allVersions,
						),
						// Delete child features, keep grandchild stories
						...itemBeingDragged.childrenIds.map((featureId) => deleteItem(product, storyMapItems, featureId)),
						...itemBeingDragged.childrenIds.flatMap((featureId) =>
							stories
								.filter((story) => story.parentId === featureId)
								.map((story) =>
									updateItem(product, storyMapItems, story.id, {parentId: itemBeingDragged.id}, allVersions),
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
						const epicRect = elementRegistry[epic.id]?.parentElement?.getBoundingClientRect()
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
						updateItem(
							product,
							storyMapItems,
							itemBeingDragged.id,
							{
								...itemBeingDragged,
								effort: 0.5,
								userValue: avg(prevEpicUserValue, nextEpicUserValue),
								keeperIds: itemBeingDragged.keeperIds,
							},
							allVersions,
						),
						// Move child stories to feature level
						...itemBeingDragged.childrenIds.map((storyId, i) =>
							updateItem(
								product,
								storyMapItems,
								storyId,
								{
									effort: 0.5,
									userValue: (i + 1) / (itemBeingDragged.childrenIds.length + 1),
									parentId: itemBeingDragged.id,
								},
								allVersions,
							),
						),
					])
				} else if (y <= layerBoundaries[1]) {
					// === Reorder features ===

					const currentFeature = itemBeingDragged
					const currentFeatureRect = elementRegistry[currentFeature.id]?.parentElement?.getBoundingClientRect()
					const parentRect = elementRegistry[currentFeature.parentId!]?.parentElement?.getBoundingClientRect()

					if (!parentRect || !currentFeatureRect) return
					if (x < parentRect.left || x > parentRect.right) {
						// Move to another epic

						const currentParent = epics.find((epic) => epic.id === currentFeature.parentId)!
						const newParent =
							x < parentRect.left ? epics[currentParent.position - 1] : epics[currentParent.position + 1]
						const newParentRect = elementRegistry[newParent?.id ?? ``]?.parentElement?.getBoundingClientRect()
						if (!newParent || !newParentRect) return
						const siblings = sortFeatures(
							storyMapItems.docs.filter(
								(item) => item.data().parentId === newParent.id && item.data().deleted === false,
							),
						)

						if (x < parentRect.left) {
							// Move to epic on the left

							const prevFeature = siblings.at(-1)
							const prevFeatureRect = elementRegistry[prevFeature?.id ?? ``]?.parentElement?.getBoundingClientRect()
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
							await updateItem(
								product,
								storyMapItems,
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
							const nextFeatureRect = elementRegistry[nextFeature?.id ?? ``]?.parentElement?.getBoundingClientRect()
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
							await updateItem(
								product,
								storyMapItems,
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
						const siblings = sortFeatures(
							storyMapItems.docs.filter((item) => item.data().parentId === currentFeature.parentId),
						)
						const prevFeature = siblings[currentFeature.position - 1]
						const nextFeature = siblings[currentFeature.position + 1]
						const currentFeatureRect =
							elementRegistry[dragInfo.itemBeingDraggedId]?.parentElement?.getBoundingClientRect()
						const prevFeatureRect =
							elementRegistry[siblings[currentFeature.position - 1]?.id ?? ``]?.parentElement?.getBoundingClientRect()
						const nextFeatureRect =
							elementRegistry[siblings[currentFeature.position + 1]?.id ?? ``]?.parentElement?.getBoundingClientRect()

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
								updateItem(product, storyMapItems, prevFeature!.id, {userValue: currentFeature.userValue}, allVersions),
								updateItem(
									product,
									storyMapItems,
									currentFeature.id,
									{userValue: prevFeature!.data().userValue},
									allVersions,
								),
							])
						} else if (x > rightBoundary) {
							operationCompleteCondition.current = (storyMapItems) => {
								const item = storyMapItems.docs.find((item) => item.id === currentFeature.id)
								if (getItemType(storyMapItems, currentFeature.id) !== `feature`) return false
								return item!.data().userValue === nextFeature!.data().userValue
							}
							await Promise.all([
								updateItem(product, storyMapItems, nextFeature!.id, {userValue: currentFeature.userValue}, allVersions),
								updateItem(
									product,
									storyMapItems,
									currentFeature.id,
									{userValue: nextFeature!.data().userValue},
									allVersions,
								),
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
						const featureRect = elementRegistry[feature.id]?.parentElement?.getBoundingClientRect()
						const prevFeature = allFeaturesSorted[feature.position - 1]
						const nextFeature = allFeaturesSorted[feature.position + 1]
						const prevRect = elementRegistry[prevFeature?.id ?? ``]?.parentElement?.getBoundingClientRect() ?? {
							right: -Infinity,
						}
						const nextRect = elementRegistry[nextFeature?.id ?? ``]?.parentElement?.getBoundingClientRect() ?? {
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
						updateItem(
							product,
							storyMapItems,
							dragInfo.itemBeingDraggedId,
							{
								...featureBeingDragged,
								createdAt: Timestamp.now(),
								updatedAt: Timestamp.now(),
								parentId: hoveringFeature.id,
								updatedAtUserId: user!.id,
								versionId: featureBeingDragged.versionId ?? currentVersionId,
							},
							allVersions,
						),
						// Delete all children
						...featureBeingDragged.childrenIds.map((childId) => deleteItem(product, storyMapItems, childId)),
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
						const featureRect = elementRegistry[feature.id]?.parentElement?.getBoundingClientRect()
						const prevFeature = allFeaturesSorted[feature.position - 1]
						const nextFeature = allFeaturesSorted[feature.position + 1]
						const prevRect = elementRegistry[prevFeature?.id ?? ``]?.parentElement?.getBoundingClientRect() ?? {
							right: -Infinity,
						}
						const nextRect = elementRegistry[nextFeature?.id ?? ``]?.parentElement?.getBoundingClientRect() ?? {
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
					await updateItem(
						product,
						storyMapItems,
						dragInfo.itemBeingDraggedId,
						{parentId: hoveringFeatureId},
						allVersions,
					)
				} else {
					// Story to feature
					const allFeatureBounds: Array<{id: string; left: number; right: number}> = []
					for (const epic of epics) {
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

					await updateItem(
						product,
						storyMapItems,
						dragInfo.itemBeingDraggedId,
						{
							...itemBeingDragged,
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

	if (!product?.exists()) return null
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
				<div
					key={epic.id}
					className={clsx(`grid justify-items-center gap-x-6`, dragInfo.itemBeingDraggedId === epic.id && `invisible`)}
					style={{gridTemplateColumns: `repeat(${epic.childrenIds.length}, auto)`}}
				>
					<Epic
						product={product}
						storyMapItems={storyMapItems}
						epicId={epic.id}
						editMode={editMode}
						onMarkForDeletion={(id: string) => {
							setItemsToBeDeleted((prev) => [...prev, id])
						}}
					/>

					{/* Pad out the remaining columns in row 1 */}
					{Array(Math.max(epic.childrenIds.length - 1, 0))
						.fill(undefined)
						.map((_, i) => (
							<div key={`row1-${i}`} />
						))}

					{/* Pad out the beginning columns in row 2 */}
					{Array(Math.max(epic.childrenIds.length, editMode ? 0 : 1))
						.fill(undefined)
						.map((_, i) => (
							<div key={`row2-${i}`} className="relative h-16 w-[calc(100%+1.5rem)]">
								{/* Top */}
								{i === 0 && (
									<div className="absolute left-1/2 top-0 h-1/2 w-px -translate-x-1/2 border border-border" />
								)}
								{/* Right */}
								{i < epic.childrenIds.length - 1 && (
									<div className="absolute left-1/2 top-1/2 h-px w-1/2 -translate-y-1/2 border border-border" />
								)}
								{/* Bottom */}
								<div className="absolute left-1/2 top-1/2 h-1/2 w-px -translate-x-1/2 border border-border" />
								{/* Left */}
								{i > 0 && <div className="absolute left-0 top-1/2 h-px w-1/2 -translate-y-1/2 border border-border" />}

								{i === epic.childrenIds.length - 1 && epic.childrenIds.length > 0 && !editMode && (
									<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
										<button
											type="button"
											onClick={() => {
												addFeature(product, storyMapItems, {parentId: epic.id}, user!.id).catch(console.error)
											}}
											className="grid h-4 w-4 place-items-center rounded-full bg-primary text-[0.6rem] text-white"
										>
											<PlusOutlined />
										</button>
									</div>
								)}
							</div>
						))}

					{features
						.filter((feature) => feature.parentId === epic.id)
						.map((feature) => {
							return (
								<div
									key={feature.id}
									className={clsx(
										`flex flex-col items-center`,
										dragInfo.itemBeingDraggedId === feature.id && `invisible`,
									)}
								>
									<Feature
										product={product}
										storyMapItems={storyMapItems}
										featureId={feature.id}
										editMode={editMode}
										onMarkForDeletion={(id: string) => {
											setItemsToBeDeleted((prev) => [...prev, id])
										}}
									/>

									{((currentVersionId !== AllVersions && !editMode) || feature.childrenIds.length > 0) && (
										<div className="h-8 w-px border border-border" />
									)}

									{stories.length === 0 && currentVersionId !== AllVersions && !editMode && (
										<button
											type="button"
											onClick={() => {
												if (currentVersionId !== AllVersions && user)
													addStory(product, storyMapItems, {parentId: feature.id}, user.id, currentVersionId).catch(
														console.error,
													)
											}}
											className="flex items-center gap-2 rounded border border-dashed border-current bg-white px-2 py-1 font-medium text-[#0e3101] dark:bg-black dark:text-[#757575]"
										>
											<FileOutlined />
											<span className="my-1">Add story</span>
										</button>
									)}

									{stories.length > 0 && versions && (
										<div className="flex flex-col items-start gap-3 rounded-lg border-2 border-border p-3">
											{stories.map((story) => (
												<div key={story.id} className={clsx(dragInfo.itemBeingDraggedId === story.id && `invisible`)}>
													<Story
														product={product}
														storyMapItems={storyMapItems}
														versions={versions}
														storyId={story.id}
														editMode={editMode}
														onMarkForDeletion={() => {
															setItemsToBeDeleted((prev) => [...prev, story.id])
														}}
													/>
												</div>
											))}

											{currentVersionId !== AllVersions && !editMode && (
												<button
													type="button"
													onClick={() => {
														if (currentVersionId !== AllVersions && user)
															addStory(product, storyMapItems, {parentId: feature.id}, user.id, currentVersionId).catch(
																console.error,
															)
													}}
													className="flex w-full items-center justify-center gap-2 rounded border border-dashed border-current bg-white px-2 py-1 font-medium text-[#0e3101] dark:bg-black dark:text-[#757575]"
												>
													<FileOutlined />
													<span className="my-1">Add story</span>
												</button>
											)}
										</div>
									)}
								</div>
							)
						})}

					{epic.childrenIds.length === 0 && !editMode && (
						<button
							type="button"
							onClick={() => {
								addFeature(product, storyMapItems, {parentId: epic.id}, user!.id).catch(console.error)
							}}
							className="flex items-center gap-2 rounded border border-dashed border-current bg-white px-2 py-1 font-medium text-[#006378] dark:bg-black dark:text-[#00a2c4]"
						>
							<CopyOutlined />
							<span className="my-1">Add feature</span>
						</button>
					)}
				</div>
			))}

			{!editMode && (
				<button
					type="button"
					onClick={() => {
						addEpic(product, storyMapItems, {}, user!.id).catch(console.error)
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
					if (!dragInfo.itemBeingDraggedId || !versions) return null
					switch (getItemType(storyMapItems, dragInfo.itemBeingDraggedId)) {
						case `epic`:
							return (
								<Epic
									product={product}
									storyMapItems={storyMapItems}
									epicId={dragInfo.itemBeingDraggedId}
									editMode={editMode}
									onMarkForDeletion={(id: string) => {
										setItemsToBeDeleted((prev) => [...prev, id])
									}}
									inert
								/>
							)
						case `feature`:
							return (
								<Feature
									product={product}
									storyMapItems={storyMapItems}
									featureId={dragInfo.itemBeingDraggedId}
									editMode={editMode}
									onMarkForDeletion={(id: string) => {
										setItemsToBeDeleted((prev) => [...prev, id])
									}}
									inert
								/>
							)
						case `story`:
							return (
								<Story
									product={product}
									storyMapItems={storyMapItems}
									versions={versions}
									storyId={dragInfo.itemBeingDraggedId}
									editMode={editMode}
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
