import type {EpicBoundaries} from "./types"
import type {Id} from "~/types"

declare global {
	interface Window {
		__storyMapScrollPosition: {current: number}
		__elementRegistry: {
			epics: Record<Id, HTMLElement | undefined>
			features: Record<Id, HTMLElement | undefined>
			stories: Record<Id, HTMLElement | undefined>
		}
		__boundaries: {epicBoundaries: EpicBoundaries[]}
		__pointerLocation: {current: [number, number]}
	}
}

if (typeof window !== `undefined`) {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__storyMapScrollPosition = window.__storyMapScrollPosition ?? {current: 0}
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__elementRegistry = window.__elementRegistry ?? {
		epics: {},
		features: {},
		stories: {},
	}
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__boundaries = window.__boundaries ?? {epicBoundaries: []}
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__pointerLocation = window.__pointerLocation ?? {current: [0, 0]}
}

export const storyMapTop = 224
export const layerBoundaries: [number, number] = [62 + storyMapTop, 156 + storyMapTop]
export let storyMapScrollPosition = window.__storyMapScrollPosition
export let elementRegistry = window.__elementRegistry
export let boundaries = window.__boundaries
export let pointerLocation = window.__pointerLocation
