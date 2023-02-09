"use client"

import {doc, getDoc} from "firebase/firestore"
import {usePathname, useRouter} from "next/navigation"
import {useEffect, useState} from "react"
import {useAuthState} from "react-firebase-hooks/auth"

import type {FC, ReactNode} from "react"

import {UserConverter} from "~/types/db/Users"
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
				if (!dbUser.data()?.hasAcceptedTos && pathname !== `/tos`) {
					router.replace(`/tos`)
					return
				}
				setUserCanAccessApp(true)
			})
			.catch(console.error)
	}, [loading, pathname, router, user])

	return <>{userCanAccessApp && children}</>
}

export default AuthenticatedLayout
