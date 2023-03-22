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

// The purpose of this code is to ensure that an elementRegistry object is available in the global scope
// and can be used by other parts of the code, without overwriting any existing __elementRegistry object.
export let elementRegistry = globalThis.__elementRegistry ?? {}

export const storyMapDebugMode = false
