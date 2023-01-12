import {atom} from "recoil"

export const productsState = atom({
	key: `productsState`,
	default: [],
})

export const activeProductState = atom({
	key: `activeProductState`,
	default: null,
})
