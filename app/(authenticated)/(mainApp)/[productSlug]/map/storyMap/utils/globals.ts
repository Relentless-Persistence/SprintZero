/* eslint-disable no-var, @typescript-eslint/no-unnecessary-condition */

import type {Id} from "~/types"

declare global {
	var __elementRegistry: Record<Id, HTMLElement | undefined>
}

export const storyMapTop = 224
export const layerBoundaries: [number, number] = [62 + storyMapTop, 156 + storyMapTop]

export let elementRegistry = globalThis.__elementRegistry ?? {}
