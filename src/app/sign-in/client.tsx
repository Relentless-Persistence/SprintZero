"use client"

import {AppleFilled, AppstoreFilled, GithubOutlined, GoogleOutlined} from "@ant-design/icons"
import {notification} from "antd"
import axios from "axios"
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
import {collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where} from "firebase/firestore"
import Image from "next/image"
import {useRouter, useSearchParams} from "next/navigation"
import {useEffect, useState} from "react"
import {useAuthState} from "react-firebase-hooks/auth"
import {z} from "zod"

import type {AuthProvider, UserCredential} from "firebase/auth"
import type {WithFieldValue} from "firebase/firestore"
import type {FC} from "react"
import type {Id} from "~/types"
import type {Product} from "~/types/db/Products"
import type {User} from "~/types/db/Users"

import {ProductInviteConverter} from "~/types/db/ProductInvites"
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

interface ProductInvite {
	productId: string
	userEmail: string
}

const SignInClientPage: FC = () => {
	const router = useRouter()

	// get invite token from sign-in URL
	const searchParams = useSearchParams()
	const inviteToken = searchParams.get(`invite_token`)

	const [user] = useAuthState(auth)
	const [hasSignedIn, setHasSignedIn] = useState(false)
	const [userInvite, setUserInvite] = useState({})
	const [isBetaUser, setIsBetaUser] = useState(false)
	const [hasValidToken, setHasValidToken] = useState(false)

	useEffect(() => {
		if (user?.uid && !hasSignedIn) router.replace(`/`)

		// issue: this is called twice during loading
		inviteToken &&
			validateInviteToken(inviteToken)
				.then()
				.catch((error) => {
					// implement logging
				})
	}, [hasSignedIn, router, user?.uid])

	// If no invite token is provided, redirect to the homepage

	const getProductInvite = async (inviteToken: string): Promise<ProductInvite | null> => {
		try {
			const response = await axios.get(`/api/get-product-invite`, {
				params: {
					inviteToken,
				},
			})
			const data = response.data

			const inviteData: ProductInvite = {
				productId: data.productId,
				userEmail: data.userEmail,
			}
			return inviteData
		} catch (error) {
			console.error(error)
			return null
		}
	}

	async function validateInviteToken(inviteToken: string | null): Promise<void> {
		// Get the ProductInvites table from Firestore
		// map user to a product using admin SDK

		//const invite = (await getDoc(doc(db, `ProductInvites`, inviteToken).withConverter(ProductInviteConverter))).data()

		// Check if the invite token exists and is not used
		// if (inviteSnap.exists && !inviteSnap.data().isUsed) {
		const invite = await getProductInvite(inviteToken)
		console.log(`I received this invite object:`, invite)
		if (invite?.productId) {
			console.log(`checking if invite exists`, invite)
			// Check if the invite has expired
			// const expiryDate = snapshot.data().expiryDate.toDate()
			// const currentDate = new Date()
			// if (expiryDate > currentDate) {
			// 	return true
			// }

			setHasValidToken(true)
			setUserInvite({
				userEmail: invite.userEmail,
				productId: invite.productId,
				token: inviteToken,
			})

			//await markInviteAsUsed(inviteToken)
			!user && notification.success({message: `Welcome! Please log in with the email where you received the invite.`})
		} else {
			console.log(`Invite token does not exist. Do nothing.`)
		}
	}

	const processUser = async (credential: UserCredential) => {
		if (!credential.user.email) throw new Error(`No email address found for user.`)
		if (!credential.user.displayName) throw new Error(`No display name found for user.`)

		setHasSignedIn(true)

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

		if()
		//setIsBetaUser(checkBetaUser)(user?.email)
		if (isNewUser) {
			// if user is coming with an invite token
			// if(betaUser)
			// {

			// temp code beta user sign-in

			// notification.success({message: `Successfully logged in. Redirecting...`, placement: `bottomRight`})
			// router.push(`/accept-terms`)
			// }
			if (hasValidToken && userInvite.userEmail != credential.user.email) {
				notification.error({message: `Sorry, you do not have a valid invite.`})
				//await signOut(auth)
			} else if (hasValidToken && userInvite.userEmail === credential.user.email) {
			console.log(`You are a new user`)
			if (tokenExists && userInvite.userEmail != credential.user.email) {
				notification.error({message: `Sorry, you do not have a valid invite.`})
				await signOut(auth)
			} else if (tokenExists && userInvite.userEmail === credential.user.email) {
				notification.success({message: `You have a valid invite.`})
				await setDoc(doc(db, `Users`, credential.user.uid), {
					avatar: credential.user.photoURL,
					email: credential.user.email,
					hasAcceptedTos: false,
					name: credential.user.displayName,
				} satisfies User)

				console.log(`I am now addin you to product as a member:`, userInvite.productId, userInvite.token)

				// const data = {type: `editor`}

				// //const memberData = {type: "editor"}
				// //const members = {members.[credential.user.uid as Id]: {type: `editor`}}
				// const productRef = doc(db, `Products`, userInvite.productId).withConverter(ProductConverter)
				// await updateDoc(productRef, {
				// 	[`members.${credential.user.uid}`]: data,
				// })

				try {
					const res = await axios.post(`/api/map-user-to-product`, {
						productId: userInvite.productId,
						userId: credential.user.uid,
						role: `editor`,
					})
					console.log(`User added to product members with role:`, res.data.role)
				} catch (error) {
					console.error(`Failed to add user to product members:`, error)
				}

				notification.success({message: `Successfully logged in. Redirecting...`, placement: `bottomRight`})
				router.push(`/accept-terms`)
				// eslint-disable-next-line no-negated-condition
			} else if (!user.hasAcceptedTos) {
				router.push(`/accept-terms`)
			} else {
				const {docs: products} = await getDocs(
					query(
						collection(db, `Products`),
						where(`members.${credential.user.uid}.type`, `in`, [`owner`, `editor`]),
					).withConverter(ProductConverter),
				)
				if (products.length === 0) router.push(`/product`)
				else router.push(`/${products[0]!.id}/map`)
			}
			// if user somehow landed on the login page and tried to log in - only for Beta
			else {
				notification.error({message: `Sorry, you are not yet enrolled in the beta.`})
				await signOut(auth)
			}
			// eslint-disable-next-line no-negated-condition
		} else if (!user.hasAcceptedTos) {
			notification.success({message: `Successfully logged in. Redirecting...`, placement: `bottomRight`})
			router.push(`/accept-terms`)
		} else {
			notification.success({message: `Successfully logged in. Redirecting...`, placement: `bottomRight`})
			const {docs: products} = await getDocs(
				query(collection(db, `Products`), where(`members.${credential.user.uid}.type`, `==`, `editor`)).withConverter(
					ProductConverter,
				),
			)
			if (products.length === 0) router.push(`/product`)
			else router.push(`/${products[0]!.id}/map`)
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
