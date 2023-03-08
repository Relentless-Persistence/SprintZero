import {usePathname} from "next/navigation"
import invariant from "tiny-invariant"

export const useActiveProductId = (): string => {
	const pathname = usePathname()
	const slugs = pathname?.split(`/`)
	const productId = slugs?.[1]
	invariant(productId, `No product ID in pathname`)

	return productId
}
