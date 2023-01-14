import {useQuery} from "@tanstack/react-query"
import {useAtomValue} from "jotai"
import {usePathname, useRouter} from "next/navigation"

import type {Id} from "~/types"

import {userIdAtom} from "./atoms"
import {getProductsByUser} from "~/utils/api/queries"

export const useActiveProductId = (): Id | undefined => {
	const pathname = usePathname()
	const slugs = pathname?.split(`/`)
	const productId = slugs?.[1] as Id | undefined

	const router = useRouter()
	const userId = useAtomValue(userIdAtom)
	useQuery({
		queryKey: [`all-products`, userId],
		queryFn: getProductsByUser(userId!),
		enabled: userId !== undefined,
		onSuccess: (products) => {
			if (products.find((product) => product.id === productId)) return
			if (products[0]) {
				router.replace(`/${products[0].id}/dashboard`)
			} else {
				router.replace(`/product`)
			}
		},
	})

	return productId
}