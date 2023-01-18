import type {StoryMapTarget} from "./types"
import type {Id} from "~/types"

import {meta} from "."
import {boundaries, dragState, layerBoundaries, pointerLocation, storyMapMeta, storyMapScrollPosition} from "./globals"

export const getTargetItem = (): StoryMapTarget => {
	if (!dragState.current) return `stay`

	const x = pointerLocation.current[0] - dragState.current.xOffsetFromCenter + storyMapScrollPosition.current
	const y = pointerLocation.current[1]

	const hoveringItems = getHoveringItems()
	const hoveringItem = hoveringItems.story ?? hoveringItems.feature ?? hoveringItems.epic

	if (y < layerBoundaries[0]) {
		// Hovering over epics

		if (dragState.current.type === `story`) return `stay`

		const isForeign = dragState.current.type !== `epic`
		if (isForeign) {
			const hoveringItemBoundaries = boundaries.epic[hoveringItem!]!

			return [x < hoveringItemBoundaries.center ? `before` : `after`, {type: `epic`, id: hoveringItem!}]
		} else {
			const startItemBoundaries = boundaries.epic[dragState.current.id]
			const prevItem = meta<`epic`>(dragState.current.id).prevItem
			const nextItem = meta<`epic`>(dragState.current.id).nextItem
			if (!startItemBoundaries) return `stay`

			if (startItemBoundaries.centerWithLeft !== undefined && x < startItemBoundaries.centerWithLeft && prevItem)
				return [`before`, {type: `epic`, id: prevItem}]
			else if (
				startItemBoundaries.centerWithRight !== undefined &&
				x >= startItemBoundaries.centerWithRight &&
				nextItem
			)
				return [`after`, {type: `epic`, id: nextItem}]
			else return `stay`
		}
	} else if (y < layerBoundaries[1]) {
		// Hovering over features

		if ((dragState.current.type === `epic` && hoveringItems.epic === dragState.current.id) || !hoveringItem)
			return `stay`

		if (hoveringItems.feature === undefined) return [`beneath`, {type: `epic`, id: hoveringItems.epic!}]

		const isForeign =
			dragState.current.type !== `feature` || meta(dragState.current.id).parent !== meta(hoveringItem).parent
		if (isForeign) {
			const hoveringItemBoundaries = boundaries.feature[hoveringItem]
			if (!hoveringItemBoundaries) return `stay`

			return [x < hoveringItemBoundaries.center ? `before` : `after`, {type: `feature`, id: hoveringItem}]
		} else {
			const startItemBoundaries = boundaries.feature[dragState.current.id]
			const prevItem = meta<`feature`>(dragState.current.id).prevItem
			const nextItem = meta<`feature`>(dragState.current.id).nextItem
			if (!startItemBoundaries) return `stay`

			if (startItemBoundaries.centerWithLeft !== undefined && x < startItemBoundaries.centerWithLeft && prevItem)
				return [`before`, {type: `feature`, id: prevItem}]
			else if (
				startItemBoundaries.centerWithRight !== undefined &&
				x >= startItemBoundaries.centerWithRight &&
				nextItem
			)
				return [`after`, {type: `feature`, id: nextItem}]
			else return `stay`
		}
	} else {
		// Hovering over stories

		if (
			dragState.current.type === `epic` ||
			(dragState.current.type === `feature` && hoveringItems.feature === dragState.current.id)
		)
			return `stay`

		if (hoveringItem === undefined) {
			if (hoveringItems.feature === undefined) return [`beneath`, {type: `feature`, id: hoveringItems.epic!}]
			else return [`beneath`, {type: `feature`, id: hoveringItems.feature}]
		}

		const hoveringItemBoundaries = boundaries.story[hoveringItem]
		if (!hoveringItemBoundaries) return `stay`
		return [y < hoveringItemBoundaries.center ? `before` : `after`, {type: `story`, id: hoveringItem}]
	}
}

export const getHoveringItems = (): {epic?: Id; feature?: Id; story?: Id} => {
	const x = pointerLocation.current[0] + storyMapScrollPosition.current
	const y = pointerLocation.current[1]

	// Find hovering epic
	let hoveringEpic: Id | undefined
	for (const id in boundaries.epic) {
		const epic = boundaries.epic[id as Id]!
		if (x >= epic.left && x < epic.right) hoveringEpic = id as Id
	}

	// Find hovering feature
	let hoveringFeature: Id | undefined
	for (const id in boundaries.feature) {
		const feature = boundaries.feature[id as Id]!
		if (x >= feature.left && x < feature.right && y >= layerBoundaries[0]) hoveringFeature = id as Id
	}

	// Find hovering story
	let hoveringStory: Id | undefined
	for (const id in boundaries.story) {
		const story = boundaries.story[id as Id]!
		const storyMeta = storyMapMeta.current[id as Id]
		if (!storyMeta) continue

		const parentBoundaries = boundaries.feature[storyMeta.parent!]!
		if (y >= story.top && y < story.bottom && x >= parentBoundaries.left && x < parentBoundaries.right)
			hoveringStory = id as Id
	}

	return {
		epic: hoveringEpic,
		feature: hoveringFeature,
		story: hoveringStory,
	}
}
