"use client"

import {useRouter} from "next/navigation"
import {useEffect} from "react"
import {useSignOut} from "react-firebase-hooks/auth"

import type {FC} from "react"

import {auth} from "~/utils/firebase"

const SignOutPage: FC = () => {
	const router = useRouter()
	const [signOut] = useSignOut(auth)

	useEffect(() => {
		signOut().then(() => {
			router.replace(`/sign-in`)
		})
	}, [router, signOut])

	return null
}

export default SignOutPage
