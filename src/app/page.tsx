"use client"

import {collectionGroup, query, where} from "firebase/firestore"
import {useRouter} from "next/navigation"
import {useEffect} from "react"
import {useAuthState} from "react-firebase-hooks/auth"
import {useCollection} from "react-firebase-hooks/firestore"

import type {FC} from "react"

import {conditionalThrow} from "~/utils/conditionalThrow"
import {auth, db} from "~/utils/firebase"

const HomePage: FC = () => {
	const router = useRouter()
	const [user, userLoading, userError] = useAuthState(auth)
	const [members, , membersError] = useCollection(
		user ? query(collectionGroup(db, `Members`), where(`id`, `==`, user.uid)) : undefined,
	)
	conditionalThrow(userError, membersError)

	useEffect(() => {
		if (!userLoading && !user) router.replace(`/sign-in`)
		if (!members) return

		const firstProduct = members.docs[0]?.ref.parent.parent
		if (firstProduct) router.replace(`/${firstProduct.id}/map`)
		else router.replace(`/product`)
	}, [members, router, user, userLoading])

	return (
		<div className="grid h-full place-items-center">
			<p className="text-xl">Redirecting you to your dashboard...</p>
		</div>
	)
}

export default HomePage
