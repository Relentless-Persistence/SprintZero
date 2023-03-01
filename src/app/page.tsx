"use client"

import {collection, query, where} from "firebase/firestore"
import {useRouter} from "next/navigation"
import {useEffect} from "react"
import {useAuthState} from "react-firebase-hooks/auth"
import {useCollectionOnce} from "react-firebase-hooks/firestore"

import type {FC} from "react"

import {ProductConverter} from "~/types/db/Products"
import {auth, db} from "~/utils/firebase"

const HomePage: FC = () => {
	const router = useRouter()
	const [user, userLoading] = useAuthState(auth)

	const [products, loading] = useCollectionOnce(
		user
			? query(collection(db, `Products`), where(`members.${user.uid}.type`, `==`, `editor`)).withConverter(
					ProductConverter,
			  )
			: undefined,
	)

	useEffect(() => {
		if (!userLoading && !user) router.replace(`/login`)
		if (!products || loading) return

		const firstProduct = products.docs[0]
		if (firstProduct) router.replace(`/${firstProduct.id}/map`)
		else router.replace(`/product`)
	}, [loading, products, router, user, userLoading])

	return (
		<div className="grid h-full place-items-center">
			<p className="text-xl">Redirecting you to your dashboard...</p>
		</div>
	)
}

export default HomePage
