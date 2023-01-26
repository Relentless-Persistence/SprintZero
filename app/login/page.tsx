"use client"

import {AppleFilled} from "@ant-design/icons"
import {message} from "antd5"
import {signInWithPopup, signOut} from "firebase9/auth"
import {doc, getDoc, setDoc} from "firebase9/firestore"
import {useAtomValue} from "jotai"
import Image from "next/image"
import {useRouter} from "next/navigation"
import React, {useEffect, useState} from "react"

import type {AuthProvider} from "firebase9/auth"
import type {FC} from "react"
import type {User} from "~/types/db/Users"

import {appleAuthProvider, auth, db, googleAuthProvider, microsoftAuthProvider} from "~/config/firebase"
import {UserSchema, Users} from "~/types/db/Users"
import {userIdAtom} from "~/utils/atoms"

const LoginPage: FC = () => {
	const router = useRouter()
	const userId = useAtomValue(userIdAtom)
	const [hasSignedIn, setHasSignedIn] = useState(false)

	useEffect(() => {
		if (userId && !hasSignedIn) router.replace(`/`)
	}, [hasSignedIn, router, userId])

	const handleOnClick = async (provider: AuthProvider) => {
		try {
			const res = await signInWithPopup(auth, provider)
			if (!res.user.email) throw new Error(`No email address found for user.`)
			if (!res.user.displayName) throw new Error(`No display name found for user.`)

			const isRpEmail = /@relentlesspersistenceinc\.com$/.test(res.user.email)
			if (isRpEmail) {
				setHasSignedIn(true)
				message.success({content: `Successfully logged in. Redirecting...`})

				const isNewUser = !(await getDoc(doc(db, Users._, res.user.uid))).exists()

				if (isNewUser) {
					await setDoc(doc(db, Users._, res.user.uid), {
						avatar: res.user.photoURL,
						email: res.user.email,
						name: res.user.displayName,
						products: [],
					} satisfies Omit<User, `id`>)
					router.push(`/tos`)
				} else {
					const _user = await getDoc(doc(db, Users._, res.user.uid))
					const user = UserSchema.parse({id: _user.id, ..._user.data()})
					if (user.products.length === 0) router.push(`/product`)
					else router.push(`/${user.products[0]}/dashboard`)
				}
			} else {
				message.error({content: `Sorry, you are not yet enrolled in the beta.`})
				await signOut(auth)
			}
		} catch (error) {
			console.error(error.message)
			message.error({content: `An error occurred while trying to log you in.`})
		}
	}

	return (
		<div className="mx-auto max-w-4xl space-y-8 p-12">
			<Image src="/images/logo_beta_light.png" alt="SprintZero logo" width={178} height={42} priority />
			<div className="space-y-2">
				<h1 className="text-4xl">Authenticate Yourself Before You Wreck Yourself</h1>
				<p className="text-2xl text-[#595959]">Select a provider below to sign in with</p>
			</div>

			<div className="flex flex-col items-center gap-4 py-24">
				<button
					type="button"
					className="flex h-14 w-80 items-center justify-start space-x-4 rounded-lg border border-black bg-white pl-7 text-xl font-medium"
					onClick={() => handleOnClick(appleAuthProvider)}
				>
					<AppleFilled className="text-[27px]" />
					<p>Sign in with Apple</p>
				</button>
				<button
					type="button"
					className="flex h-14 w-80 items-center justify-start space-x-4 rounded-lg border border-black bg-white pl-7 text-xl font-medium"
					onClick={() => handleOnClick(googleAuthProvider)}
				>
					<Image src="/images/googleIcon.png" alt="" width={29} height={29} priority />
					<p>Sign in with Google</p>
				</button>

				<button
					type="button"
					className="flex h-14 w-80 items-center justify-start space-x-4 rounded-lg border border-black bg-white pl-8 text-xl font-medium"
					onClick={() => handleOnClick(microsoftAuthProvider)}
				>
					<Image src="/images/microsoftIcon.png" alt="" width={23} height={23} priority />
					<p>Sign in with Microsoft</p>
				</button>
			</div>
		</div>
	)
}

export default LoginPage
