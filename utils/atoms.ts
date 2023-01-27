import {atom, useAtomValue} from "jotai"
import {useRouter} from "next/navigation"

import type {Id} from "~/types"
import type {Product} from "~/types/db/Products"

export const userIdAtom = atom<Id | `signed-out` | undefined>(undefined)
export const useUserId = (): Id | undefined => {
	const userId = useAtomValue(userIdAtom)
	const router = useRouter()

	if (userId === `signed-out`) {
		router.replace(`/login`)
		return undefined
	}
	return userId
}

export const activeProductAtom = atom<Product | undefined>(undefined)
