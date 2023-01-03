import {usePathname} from "next/navigation"

import type {Id} from "~/types"

export const useActiveProductId = (): Id | null => {
	const pathname = usePathname()
	const slugs = pathname?.split(`/`)
	const productId = slugs?.[1] as Id | undefined
	return productId ?? null
}
