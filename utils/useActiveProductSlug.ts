import {useQuery} from "@tanstack/react-query"
import {usePathname} from "next/navigation"

import type {Id} from "~/types"

import {getProductBySlug} from "./fetch"

export const useActiveProductSlug = (): string | null => {
	const pathname = usePathname()
	const slugs = pathname?.split(`/`)
	const productId = slugs?.[1]
	return productId ?? null
}

export const useActiveProductId = (): Id | null => {
	const slug = useActiveProductSlug()
	const {data: product} = useQuery({
		queryKey: [`product`, slug],
		queryFn: getProductBySlug(slug!),
		enabled: slug !== null,
	})
	return product?.id ?? null
}
