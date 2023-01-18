import type {EpicBoundaries, FeatureBoundaries, StoryBoundaries, StoryMapMeta} from "./types"
import type {Id} from "~/types"

declare global {
	interface Window {
		__storyMapScrollPosition: {current: number}
		__storyMapMeta: {current: StoryMapMeta}
		__elementRegistry: Record<
			Id,
			| {
					container: HTMLElement
					content: HTMLElement
			  }
			| undefined
		>
		__boundaries: {
			epic: Record<Id, EpicBoundaries>
			feature: Record<Id, FeatureBoundaries>
			story: Record<Id, StoryBoundaries>
		}
		__pointerLocation: {current: [number, number]}
		__dragState: {
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
}

if (typeof window !== `undefined`) {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__storyMapScrollPosition = window.__storyMapScrollPosition ?? {current: 0}
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__storyMapMeta = window.__storyMapMeta ?? {current: {}}
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__elementRegistry = window.__elementRegistry ?? {epics: {}, features: {}, stories: {}}
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__boundaries = window.__boundaries ?? {epic: {}, feature: {}, story: {}}
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__pointerLocation = window.__pointerLocation ?? {current: [0, 0]}
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__dragState = window.__dragState ?? {current: undefined}
}

export const storyMapTop = 224
export const layerBoundaries: [number, number] = [62 + storyMapTop, 156 + storyMapTop]
export let storyMapScrollPosition = window.__storyMapScrollPosition
export let storyMapMeta = window.__storyMapMeta
export let elementRegistry = window.__elementRegistry
export let boundaries = window.__boundaries
export let pointerLocation = window.__pointerLocation
export let dragState = window.__dragState
