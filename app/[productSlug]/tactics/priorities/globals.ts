/* eslint-disable no-var */

declare global {
	var __pointerLocation: {current: [number, number]}
	var __matrixRect: {current: DOMRect}
}

if (typeof window !== `undefined`) {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	globalThis.__pointerLocation = globalThis.__pointerLocation ?? {current: [0, 0]}
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	globalThis.__matrixRect = globalThis.__matrixRect ?? {
		current: {x: 0, y: 0, width: 1, height: 1, top: 0, right: 1, bottom: 1, left: 0},
	}
}

export let pointerLocation = globalThis.__pointerLocation ?? {current: [0, 0]}
export let matrixRect = globalThis.__matrixRect ?? {
	current: {x: 0, y: 0, width: 1, height: 1, top: 0, right: 1, bottom: 1, left: 0},
}
