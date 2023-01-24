"use client"

import {useQuery} from "@tanstack/react-query"
import {useAtomValue} from "jotai"
import {useRouter} from "next/navigation"

import type {FC} from "react"

import {getProductsByUser} from "~/utils/api/queries"
import {userIdAtom} from "~/utils/atoms"

const HomePage: FC = () => {
	const router = useRouter()
	const userId = useAtomValue(userIdAtom)

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
