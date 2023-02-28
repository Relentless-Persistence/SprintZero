"use client"

import {AppleFilled, AppstoreFilled, GithubOutlined, GoogleOutlined} from "@ant-design/icons"
import {notification} from "antd"
import {FirebaseError} from "firebase/app"
import {
	GithubAuthProvider,
	GoogleAuthProvider,
	OAuthProvider,
	fetchSignInMethodsForEmail,
	linkWithCredential,
	sendEmailVerification,
	signInWithPopup,
	signOut,
} from "firebase/auth"
import {collection, doc, getDoc, getDocs, query, setDoc, where} from "firebase/firestore"
import Image from "next/image"
import {useRouter} from "next/navigation"
import {useEffect, useState} from "react"
import {useAuthState} from "react-firebase-hooks/auth"
import {z} from "zod"

import type {AuthProvider, UserCredential} from "firebase/auth"
import type {FC} from "react"
import type {User} from "~/types/db/Users"

import {ProductConverter} from "~/types/db/Products"
import {UserConverter} from "~/types/db/Users"
import {
	appleAuthProvider,
	auth,
	db,
	githubAuthProvider,
	googleAuthProvider,
	microsoftAuthProvider,
} from "~/utils/firebase"

const SignInClientPage: FC = () => {
	const router = useRouter()
	const [user] = useAuthState(auth)
	const [hasSignedIn, setHasSignedIn] = useState(false)

	useEffect(() => {
		if (user?.uid && !hasSignedIn) router.replace(`/`)
	}, [hasSignedIn, router, user?.uid])

	const processUser = async (credential: UserCredential) => {
		if (!credential.user.email) throw new Error(`No email address found for user.`)
		if (!credential.user.displayName) throw new Error(`No display name found for user.`)

		const isRpEmail = /@relentlesspersistenceinc\.com$/.test(credential.user.email)
		if (isRpEmail) {
			setHasSignedIn(true)
			notification.success({message: `Successfully logged in. Redirecting...`, placement: `bottomRight`})

			if (auth.currentUser && !auth.currentUser.emailVerified) {
				await sendEmailVerification(auth.currentUser).then(() => {
					notification.success({
						message: `Email Verification`,
						description: `Please check your email to verify your account.`,
						placement: `bottomRight`,
					})
				})
			}

			const user = (await getDoc(doc(db, `Users`, credential.user.uid).withConverter(UserConverter))).data()
			const isNewUser = !user

			if (isNewUser) {
				await setDoc(doc(db, `Users`, credential.user.uid), {
					avatar: credential.user.photoURL,
					email: credential.user.email,
					hasAcceptedTos: false,
					name: credential.user.displayName,
				} satisfies User)
				router.push(`/accept-terms`)
				// eslint-disable-next-line no-negated-condition
			} else if (!user.hasAcceptedTos) {
				router.push(`/accept-terms`)
			} else {
				const {docs: products} = await getDocs(
					query(collection(db, `Products`), where(`members.${credential.user.uid}.type`, `==`, `editor`)).withConverter(
						ProductConverter,
					),
				)
				if (products.length === 0) router.push(`/product`)
				else router.push(`/${products[0]!.id}/map`)
			}
		} else {
			notification.error({message: `Sorry, you are not yet enrolled in the beta.`})
			await signOut(auth)
		}
	}

	const handleOnClick = async (provider: AuthProvider) => {
		try {
			const credential = await signInWithPopup(auth, provider)
			await processUser(credential)
		} catch (error) {
			try {
				if (error instanceof FirebaseError && error.code === `auth/account-exists-with-different-credential`) {
					if (!error.customData || !(`_tokenResponse` in error.customData)) throw error
					const _tokenResponse = z
						.object({
							email: z.string(),
						})
						.parse(error.customData._tokenResponse)
					const methods = await fetchSignInMethodsForEmail(auth, _tokenResponse.email)
					const supportedPopupSignInMethods = [
						`apple.com`,
						GoogleAuthProvider.PROVIDER_ID,
						GithubAuthProvider.PROVIDER_ID,
						`microsoft.com`,
					]
					const signInMethod = methods.find((method) => supportedPopupSignInMethods.includes(method))
					if (!signInMethod) throw error

					let provider: OAuthProvider | GoogleAuthProvider | GithubAuthProvider
					switch (signInMethod) {
						case `apple.com`: {
							provider = appleAuthProvider
							break
						}
						case GoogleAuthProvider.PROVIDER_ID: {
							provider = googleAuthProvider
							break
						}
						case GithubAuthProvider.PROVIDER_ID: {
							provider = githubAuthProvider
							break
						}
						case `microsoft.com`: {
							provider = microsoftAuthProvider
							break
						}
						default: {
							throw new Error(`Unsupported sign in method: ${signInMethod}`)
						}
					}
					provider.setCustomParameters({login_hint: _tokenResponse.email})
					const result = await signInWithPopup(auth, provider)
					const user = result.user
					const credential = OAuthProvider.credentialFromError(error)
					if (credential === null) throw error
					await linkWithCredential(user, credential)
					await processUser(result)
				}
			} catch (error) {
				notification.error({message: `An error occurred while trying to log you in.`})
				throw error
			}
		}
	}

	return (
		<div className="h-full w-full px-12">
			<div className="mx-auto flex h-full max-w-5xl flex-col py-8">
				<Image src="/images/logo_beta_light.png" alt="SprintZero logo" width={238} height={56} priority />
				<div className="mt-6">
					<h1 className="text-3xl font-semibold">Authenticate Yourself Before You Wreck Yourself</h1>
					<p className="text-xl text-textSecondary">Select a provider below to create an account</p>
				</div>

				<div className="flex grow flex-col items-center justify-center gap-4">
					<button
						type="button"
						className="flex h-14 w-80 items-center justify-center gap-4 rounded-lg border border-black bg-white text-xl font-medium"
						onClick={() => {
							handleOnClick(appleAuthProvider).catch(console.error)
						}}
						data-testid="apple-sign-in"
					>
						<AppleFilled className="text-2xl" />
						<p>Sign in with Apple</p>
					</button>
					<button
						type="button"
						className="flex h-14 w-80 items-center justify-center gap-4 rounded-lg border border-black bg-white text-xl font-medium"
						onClick={() => {
							handleOnClick(googleAuthProvider).catch(console.error)
						}}
						data-testid="google-sign-in"
					>
						<GoogleOutlined className="text-2xl" />
						<p>Sign in with Google</p>
					</button>

					<button
						type="button"
						className="flex h-14 w-80 items-center justify-center gap-4 rounded-lg border border-black bg-white text-xl font-medium"
						onClick={() => {
							handleOnClick(githubAuthProvider).catch(console.error)
						}}
						data-testid="github-sign-in"
					>
						<GithubOutlined className="text-2xl" />
						<p>Sign in with GitHub</p>
					</button>

					<button
						type="button"
						className="flex h-14 w-80 items-center justify-center gap-4 rounded-lg border border-black bg-white text-xl font-medium"
						onClick={() => {
							handleOnClick(microsoftAuthProvider).catch(console.error)
						}}
						data-testid="microsoft-sign-in"
					>
						<AppstoreFilled className="text-2xl" />
						<p>Sign in with Microsoft</p>
					</button>
				</div>
			</div>
		</div>
	)
}

export default SignInClientPage
