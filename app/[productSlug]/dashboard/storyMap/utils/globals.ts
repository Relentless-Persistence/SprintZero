/* eslint-disable no-var, @typescript-eslint/no-unnecessary-condition */

import type {EpicBoundaries, FeatureBoundaries, StoryBoundaries, StoryMapMeta} from "./types"
import type {Id} from "~/types"

declare global {
	var __storyMapScrollPosition: {current: number}
	var __storyMapMeta: {current: StoryMapMeta}
	var __elementRegistry: Record<
		Id,
		| {
				container: HTMLElement
				content: HTMLElement
		  }
		| undefined
	>
	var __boundaries: {
		epic: Record<Id, EpicBoundaries>
		feature: Record<Id, FeatureBoundaries>
		story: Record<Id, StoryBoundaries>
	}
	var __pointerLocation: {current: [number, number]}
	var __dragState: {
		current:
			| {
					id: Id
					type: `epic` | `feature` | `story`
					offset: [number, number]
					xOffsetFromCenter: number
			  }
			| undefined
	}
}

export const storyMapTop = 224
export const layerBoundaries: [number, number] = [62 + storyMapTop, 156 + storyMapTop]

export let storyMapScrollPosition = globalThis.__storyMapScrollPosition ?? {current: 0}
export let storyMapMeta = globalThis.__storyMapMeta ?? {current: {}}
export let elementRegistry = globalThis.__elementRegistry ?? {epics: {}, features: {}, stories: {}}
export let boundaries = globalThis.__boundaries ?? {epic: {}, feature: {}, story: {}}
export let pointerLocation = globalThis.__pointerLocation ?? {current: [0, 0]}
export let dragState = globalThis.__dragState ?? {current: undefined}
