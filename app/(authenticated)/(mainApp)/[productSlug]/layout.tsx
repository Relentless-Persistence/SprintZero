"use client"

import {doc} from "firebase/firestore"
import {useRouter} from "next/navigation"
import {useEffect} from "react"
import {useAuthState} from "react-firebase-hooks/auth"
import {useDocumentDataOnce} from "react-firebase-hooks/firestore"
import invariant from "tiny-invariant"

import type {FC, ReactNode} from "react"

import {ProductConverter} from "~/types/db/Products"
import {auth, db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

export type DashboardLayoutProps = {
	children: ReactNode
}

const DashboardLayout: FC<DashboardLayoutProps> = ({children}) => {
	const router = useRouter()
	const [user] = useAuthState(auth)
	invariant(user, `User must be logged in.`)
	const activeProductId = useActiveProductId()

	const [product, loading] = useDocumentDataOnce(doc(db, `Products`, activeProductId).withConverter(ProductConverter))

	useEffect(() => {
		if (!product && !loading) router.replace(`/`)
	}, [loading, product, router])

	if (loading || !product) return null
	return <>{children}</>
}

export default DashboardLayout
