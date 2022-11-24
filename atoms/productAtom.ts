import {atom} from "recoil"

type Products = Array<unknown>

export const productsState = atom<Products>({
	key: `productsState`,
	default: [],
})

type ActiveProduct = {
	id?: string
}

export const activeProductState = atom<ActiveProduct | null>({
	key: `activeProductState`,
	default: null,
})
