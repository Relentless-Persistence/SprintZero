"use client"

import {doc, getDoc} from "firebase/firestore"
import {usePathname, useRouter} from "next/navigation"
import {useEffect, useState} from "react"
import {useAuthState} from "react-firebase-hooks/auth"
import {useDocument} from "react-firebase-hooks/firestore"
import invariant from "tiny-invariant"

import type {FC, ReactNode} from "react"

import {AppContext} from "./AppContext"
import {ProductConverter} from "~/types/db/Products"
import {UserConverter} from "~/types/db/Users"
import {conditionalThrow} from "~/utils/conditionalThrow"
import {auth, db} from "~/utils/firebase"

export type AuthenticatedLayoutProps = {
	children: ReactNode
}

const AuthenticatedLayout: FC<AuthenticatedLayoutProps> = ({children}) => {
	const router = useRouter()
	const pathname = usePathname()
	const [user, loading] = useAuthState(auth)
	const [userCanAccessApp, setUserCanAccessApp] = useState(false)

	useEffect(() => {
		if (loading) return
		if (!user) {
			router.replace(`/sign-in`)
			return
		}
		getDoc(doc(db, `Users`, user.uid).withConverter(UserConverter))
			.then((dbUser) => {
				if (!dbUser.data()?.hasAcceptedTos && pathname !== `/accept-terms`) {
					router.replace(`/accept-terms`)
					return
				}
				setUserCanAccessApp(true)
			})
			.catch(console.error)
	}, [loading, pathname, router, user])

	const [dbUser, , error] = useDocument(user ? doc(db, `Users`, user.uid).withConverter(UserConverter) : undefined)
	conditionalThrow(error)

	const slugs = pathname?.split(`/`)
	const productId = slugs?.[1]
	invariant(productId, `No product ID in pathname`)
	const [product] = useDocument(doc(db, `Products`, productId).withConverter(ProductConverter))

	if (pathname === `/product` && userCanAccessApp) return <>{children}</>
	if (!product?.exists() || !dbUser?.exists() || !userCanAccessApp) return null
	return <AppContext.Provider value={{product, user: dbUser}}>{children}</AppContext.Provider>
}

export default AuthenticatedLayout
