"use client"

import {useRouter} from "next/navigation"
import {useEffect} from "react"
import {useAuthState} from "react-firebase-hooks/auth"

import type {FC, ReactNode} from "react"

import {auth} from "~/utils/firebase"

export type AuthenticatedLayoutProps = {
	children: ReactNode
}

const AuthenticatedLayout: FC<AuthenticatedLayoutProps> = ({children}) => {
	const router = useRouter()

	const [user, loading] = useAuthState(auth)
	useEffect(() => {
		if (!user && !loading) router.replace(`/login`)
	}, [loading, router, user])

	return <>{!loading && user && children}</>
}

export default AuthenticatedLayout
