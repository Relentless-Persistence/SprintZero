"use client"

import {doc, getDoc} from "firebase/firestore"
import {usePathname, useRouter} from "next/navigation"
import {useEffect, useState} from "react"
import {useAuthState, useIdToken} from "react-firebase-hooks/auth"
import {useDocument} from "react-firebase-hooks/firestore"

import type {FC, ReactNode} from "react"

import {ProductContext} from "./useProduct"
import {ProductConverter} from "~/types/db/Products"
import {UserConverter} from "~/types/db/Users"
import {auth, db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

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

	const [credential] = useIdToken(auth)
	useEffect(() => {
		credential
			?.getIdToken()
			?.then((token) => {
				document.cookie = `firebaseSession=${token}; path=/; sameSite=strict; secure;`
			})
			.catch(console.error)
	}, [credential])

	const activeProductId = useActiveProductId()
	const [product] = useDocument(doc(db, `Products`, activeProductId).withConverter(ProductConverter))

	if (pathname === `/product` && userCanAccessApp) return <>{children}</>
	if (!product?.exists() || !userCanAccessApp) return null
	return <ProductContext.Provider value={product}>{children}</ProductContext.Provider>
}

export default AuthenticatedLayout
