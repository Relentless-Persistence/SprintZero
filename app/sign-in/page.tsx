"use client"

import {AppleFilled, GithubOutlined} from "@ant-design/icons"
import {notification} from "antd"
import {signInWithPopup, signOut} from "firebase/auth"
import {collection, doc, getDoc, getDocs, query, setDoc, where} from "firebase/firestore"
import Image from "next/image"
import {useRouter} from "next/navigation"
import {useEffect, useState} from "react"
import {useAuthState} from "react-firebase-hooks/auth"

import type {AuthProvider} from "firebase/auth"
import type {FC} from "react"
import type {User} from "~/types/db/Users"

import {ProductConverter, Products} from "~/types/db/Products"
import {UserConverter, Users} from "~/types/db/Users"
import {
	appleAuthProvider,
	auth,
	db,
	googleAuthProvider,
	microsoftAuthProvider,
	githubAuthProvider,
} from "~/utils/firebase"

const SignInPage: FC = () => {
	const router = useRouter()
	const [user] = useAuthState(auth)
	const [hasSignedIn, setHasSignedIn] = useState(false)

	useEffect(() => {
		if (user?.uid && !hasSignedIn) router.replace(`/`)
	}, [hasSignedIn, router, user?.uid])

	const handleOnClick = async (provider: AuthProvider) => {
		try {
			const res = await signInWithPopup(auth, provider)
			if (!res.user.email) throw new Error(`No email address found for user.`)
			if (!res.user.displayName) throw new Error(`No display name found for user.`)

			const isRpEmail = /@relentlesspersistenceinc\.com$/.test(res.user.email)
			if (isRpEmail) {
				setHasSignedIn(true)
				notification.success({message: `Successfully logged in. Redirecting...`, placement: `bottomRight`})

				const user = (await getDoc(doc(db, Users._, res.user.uid).withConverter(UserConverter))).data()
				const isNewUser = !user

				if (isNewUser) {
					await setDoc(doc(db, Users._, res.user.uid), {
						avatar: res.user.photoURL,
						email: res.user.email,
						hasAcceptedTos: false,
						name: res.user.displayName,
					} satisfies User)
					router.push(`/tos`)
					// eslint-disable-next-line no-negated-condition
				} else if (!user.hasAcceptedTos) {
					router.push(`/tos`)
				} else {
					const {docs: products} = await getDocs(
						query(
							collection(db, Products._),
							where(`${Products.members}.${res.user.uid}.type`, `==`, `editor`),
						).withConverter(ProductConverter),
					)
					if (products.length === 0) router.push(`/product`)
					else router.push(`/${products[0]!.id}/map`)
				}
			} else {
				notification.error({message: `Sorry, you are not yet enrolled in the beta.`})
				await signOut(auth)
			}
		} catch (error) {
			console.error(error.message)
			notification.error({message: `An error occurred while trying to log you in.`})
		}
	}

	return (
		<div className="mx-auto max-w-4xl space-y-8 p-12">
			<Image src="/images/logo_beta_light.png" alt="SprintZero logo" width={178} height={42} priority />
			<div className="space-y-2">
				<h1 className="text-4xl">Authenticate Yourself Before You Wreck Yourself</h1>
				<p className="text-2xl text-gray">Select a provider below to sign in with</p>
			</div>

			<div className="flex flex-col items-center gap-4 py-24">
				<button
					type="button"
					className="flex h-14 w-80 items-center justify-start space-x-4 rounded-lg border border-black bg-white pl-7 text-xl font-medium"
					onClick={() => handleOnClick(appleAuthProvider)}
					data-testid="apple-sign-in"
				>
					<AppleFilled className="text-[27px]" />
					<p>Sign in with Apple</p>
				</button>
				<button
					type="button"
					className="flex h-14 w-80 items-center justify-start space-x-4 rounded-lg border border-black bg-white pl-7 text-xl font-medium"
					onClick={() => handleOnClick(googleAuthProvider)}
					data-testid="google-sign-in"
				>
					<Image src="/images/googleIcon.png" alt="" width={29} height={29} priority />
					<p>Sign in with Google</p>
				</button>

				<button
					type="button"
					className="flex h-14 w-80 items-center justify-start space-x-4 rounded-lg border border-black bg-white pl-7 text-xl font-medium"
					onClick={() => handleOnClick(githubAuthProvider)}
					data-testid="github-sign-in"
				>
					<GithubOutlined />
					<p>Sign in with Github</p>
				</button>

				<button
					type="button"
					className="flex h-14 w-80 items-center justify-start space-x-4 rounded-lg border border-black bg-white pl-8 text-xl font-medium"
					onClick={() => handleOnClick(microsoftAuthProvider)}
					data-testid="microsoft-sign-in"
				>
					<Image src="/images/microsoftIcon.png" alt="" width={23} height={23} priority />
					<p>Sign in with Microsoft</p>
				</button>
			</div>
		</div>
	)
}

export default SignInPage
