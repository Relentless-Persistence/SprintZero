/* eslint-disable no-var, @typescript-eslint/no-unnecessary-condition */

import type {Id} from "~/types"

declare global {
	var __elementRegistry: Record<Id, HTMLElement | undefined>
}

export const storyMapTop = 224
export const layerBoundaries = [62 + storyMapTop, 156 + storyMapTop] as const

export let elementRegistry = globalThis.__elementRegistry ?? {}
