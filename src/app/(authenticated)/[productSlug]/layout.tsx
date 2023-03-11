"use client"

import {Layout} from "antd"
import {doc} from "firebase/firestore"
import {usePathname, useRouter} from "next/navigation"
import {useEffect, useState} from "react"
import {useErrorHandler} from "react-error-boundary"
import {useAuthState} from "react-firebase-hooks/auth"
import {useDocument} from "react-firebase-hooks/firestore"
import invariant from "tiny-invariant"

import type {FC, ReactNode} from "react"

import {AppContext} from "./AppContext"
import Header from "./Header"
import {ProductConverter} from "~/types/db/Products"
import {MemberConverter} from "~/types/db/Products/Members"
import {UserConverter} from "~/types/db/Users"
import {auth, db} from "~/utils/firebase"

export type MainAppLayoutProps = {
	children: ReactNode
}

const MainAppLayout: FC<MainAppLayoutProps> = ({children}) => {
	const router = useRouter()
	const pathname = usePathname()

	const slugs = pathname?.split(`/`)
	const productId = slugs?.[1]
	invariant(productId, `No product ID in pathname`)

	const [user, , userError] = useAuthState(auth)
	const [product, , productError] = useDocument(doc(db, `Products`, productId).withConverter(ProductConverter))
	const [dbUser, , dbUserError] = useDocument(
		user ? doc(db, `Users`, user.uid).withConverter(UserConverter) : undefined,
	)
	const [member, , memberError] = useDocument(
		product && user ? doc(product.ref, `Members`, user.uid).withConverter(MemberConverter) : undefined,
	)

	const errorHandler = useErrorHandler()
	useEffect(() => {
		if (productError?.code === `permission-denied` || memberError?.code === `permission-denied`) {
			router.replace(`/`)
			return
		}
		errorHandler(productError ?? dbUserError ?? memberError ?? userError)
	}, [dbUserError, errorHandler, memberError, productError, router, userError])

	if (!member?.exists() || !product?.exists() || !dbUser?.exists()) return null
	return (
		<AppContext.Provider value={{product, user: dbUser, member}}>
			<Layout className="h-full">
				<Header />
				<Layout>{children}</Layout>
			</Layout>
		</AppContext.Provider>
	)
}

export default MainAppLayout
