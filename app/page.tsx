"use client"

import {useQuery} from "@tanstack/react-query"
import {useAtomValue} from "jotai"
import {useRouter} from "next/navigation"

import type {FC} from "react"

import {userIdAtom} from "~/utils/atoms"
import {getAllProducts} from "~/utils/fetch"

const HomePage: FC = () => {
	const router = useRouter()
	const userId = useAtomValue(userIdAtom)

	useQuery({
		queryKey: [`all-products`, userId],
		queryFn: getAllProducts(userId!),
		enabled: userId !== null,
		onSuccess: (products) => {
			const firstProduct = products[0]
			if (!firstProduct) {
				router.replace(`/product`)
			} else {
				router.replace(`/${firstProduct.id}/dashboard`)
			}
		},
	})

	return null
}

export default HomePage
