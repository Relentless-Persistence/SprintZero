import {usePathname} from "next/navigation"
import invariant from "tiny-invariant"

import type {Id} from "~/types"

export const useActiveProductId = (): Id => {
	const pathname = usePathname()
	const slugs = pathname?.split(`/`)
	const productId = slugs?.[1]
	invariant(productId, `No product ID in pathname`)

	return productId as Id
}
