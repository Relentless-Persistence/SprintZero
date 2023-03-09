/* eslint-disable no-var, @typescript-eslint/no-unnecessary-condition */

declare global {
	var __elementRegistry: Record<
		string,
		{
			container: HTMLElement | undefined
			content: HTMLElement | undefined
		}
	>
}

export const storyMapTop = 224
export const layerBoundaries = [62 + storyMapTop, 156 + storyMapTop] as const

export let elementRegistry = globalThis.__elementRegistry ?? {}
