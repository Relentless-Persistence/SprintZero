"use client"

import {useQuery} from "@tanstack/react-query"
import {useAtomValue} from "jotai"
import {useRouter} from "next/navigation"
import {useEffect} from "react"

import type {FC} from "react"
import type {Id} from "~/types"

import {getProductsByUser} from "~/utils/api/queries"
import {userIdAtom} from "~/utils/atoms"

const HomePage: FC = () => {
	const router = useRouter()
	const userId = useAtomValue(userIdAtom)

	useEffect(() => {
		if (userId === undefined) router.replace(`/login`)
	}, [router, userId])

	useQuery({
		queryKey: [`all-products`, userId],
		queryFn: getProductsByUser(userId as Id),
		enabled: userId !== undefined && userId !== `signed-out`,
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
