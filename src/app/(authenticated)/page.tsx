"use client"

import {collection, query, where} from "firebase/firestore"
import {useRouter} from "next/navigation"
import {useEffect} from "react"
import {useAuthState} from "react-firebase-hooks/auth"
import {useCollectionOnce} from "react-firebase-hooks/firestore"
import invariant from "tiny-invariant"

import type {FC} from "react"

import {ProductConverter} from "~/types/db/Products"
import {auth, db} from "~/utils/firebase"

const HomePage: FC = () => {
	const router = useRouter()
	const [user] = useAuthState(auth)
	invariant(user, `User must be logged in.`)

	const [products, loading] = useCollectionOnce(
		query(collection(db, `Products`), where(`members.${user.uid}.type`, `==`, `editor`)).withConverter(
			ProductConverter,
		),
	)

	useEffect(() => {
		if (!products || loading) return

		const firstProduct = products.docs[0]
		if (firstProduct) router.replace(`/${firstProduct.id}/map`)
		else router.replace(`/product`)
	}, [loading, products, router])

	return (
		<div className="grid h-full place-items-center">
			<p className="text-xl">Redirecting you to your dashboard...</p>
		</div>
	)
}

export default HomePage
