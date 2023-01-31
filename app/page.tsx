"use client"

import {useQuery} from "@tanstack/react-query"
import {useRouter} from "next/navigation"

import type {FC} from "react"

import {getProductsByUser} from "~/utils/api/queries"
import {useUserId} from "~/utils/atoms"

const HomePage: FC = () => {
	const router = useRouter()
	const userId = useUserId()

	useQuery({
		queryKey: [`all-products`, userId],
		queryFn: getProductsByUser(userId!),
		enabled: userId !== undefined,
		onSuccess: (products) => {
			const firstProduct = products[0]
			if (firstProduct) {
				router.replace(`/${firstProduct.id}/dashboard`)
			} else {
				router.replace(`/product`)
			}
		},
	})

	return (
		<div className="grid h-full place-items-center">
			<p className="text-xl">Redirecting you to your dashboard...</p>
		</div>
	)
}

export default HomePage
