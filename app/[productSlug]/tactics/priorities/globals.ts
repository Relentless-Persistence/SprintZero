declare global {
	interface Window {
		__pointerLocation: {current: [number, number]}
		__matrixRect: {current: DOMRect}
	}
}

if (typeof window !== `undefined`) {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__pointerLocation = window.__pointerLocation ?? {current: [0, 0]}
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__matrixRect = window.__matrixRect ?? {
		current: {x: 0, y: 0, width: 1, height: 1, top: 0, right: 1, bottom: 1, left: 0},
	}
}

export let pointerLocation = window.__pointerLocation
export let matrixRect = window.__matrixRect
