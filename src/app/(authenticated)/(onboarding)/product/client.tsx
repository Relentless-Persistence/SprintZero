"use client"

import {Button} from "antd"
import {doc} from "firebase/firestore"
import {motion} from "framer-motion"
import {useRouter} from "next/navigation"
import {useState} from "react"
import {useErrorHandler} from "react-error-boundary"
import {useAuthState} from "react-firebase-hooks/auth"
import {useDocument} from "react-firebase-hooks/firestore"

import type {FC} from "react"
import type {Product} from "~/types/db/Products"

import Slide1 from "./Slide1"
import Slide2 from "./Slide2"
import Slide3 from "./Slide3"
import Slide4 from "./Slide4"
import {UserConverter} from "~/types/db/Users"
import {auth, db} from "~/utils/firebase"
import {trpc} from "~/utils/trpc"

type FormInputs = Pick<
	Product,
	`cadence` | `effortCost` | `effortCostCurrencySymbol` | `name` | `sprintStartDayOfWeek`
> & {
	email1: string | null
	email2: string | null
	email3: string | null
}

const ProductSetupClientPage: FC = () => {
	const router = useRouter()
	const [currentSlide, setCurrentSlide] = useState(0)
	const [canProceed, setCanProceed] = useState(false)
	const [formData, setFormData] = useState<Partial<FormInputs>>({})
	const [hasSubmitted, setHasSubmitted] = useState(false)
	const createProduct = trpc.product.create.useMutation()
	const inviteUser = trpc.product.inviteUser.useMutation()

	const [user, , userError] = useAuthState(auth)
	useErrorHandler(userError)
	const [dbUser, , dbUserError] = useDocument(
		user ? doc(db, `Users`, user.uid).withConverter(UserConverter) : undefined,
	)
	useErrorHandler(dbUserError)

	const submitForm = async (data: FormInputs) => {
		if (hasSubmitted || !dbUser?.exists() || !user) return
		setHasSubmitted(true)

		const {productId} = await createProduct.mutateAsync({
			cadence: data.cadence,
			effortCost: data.effortCost,
			effortCostCurrencySymbol: data.effortCostCurrencySymbol,
			name: data.name,
			sprintStartDayOfWeek: data.sprintStartDayOfWeek,
			userIdToken: await user.getIdToken(true),
			userAvatar: user.photoURL,
			userName: user.displayName ?? user.email ?? `Unknown User`,
		})

		let {email1, email2, email3} = data
		if (email1 === email2) email2 = null
		if (email1 === email3) email3 = null
		if (email2 === email3) email3 = null

		for (const recipient of [email1, email2, email3]) {
			if (!recipient) continue
			await inviteUser.mutateAsync({
				email: recipient,
				productId,
				userIdToken: await user.getIdToken(),
			})
		}

		router.push(`/${productId}/map`)
	}

	return (
		<div className="flex h-full flex-col gap-6">
			<div className="leading-normal">
				<h1 className="text-3xl font-semibold">Product Configuration</h1>
				<h2 className="text-xl text-textSecondary">
					Almost time to start building! We just require a few data points before we can begin
				</h2>
			</div>
			<div className="flex w-full grow items-center">
				<div className="shrink-0 basis-[calc(50%-12rem)]" />
				<motion.div
					className="flex h-fit w-max gap-24"
					animate={{x: `calc(-${currentSlide} * 30rem)`}}
					transition={{duration: 0.3, ease: [0.65, 0, 0.35, 1]}}
				>
					<Slide1
						currentSlide={currentSlide}
						setCanProceed={setCanProceed}
						onComplete={(data) => {
							setFormData((cur) => ({...cur, ...data}))
							setCurrentSlide(1)
						}}
					/>
					<Slide2
						currentSlide={currentSlide}
						setCanProceed={setCanProceed}
						onComplete={(data) => {
							setFormData((cur) => ({...cur, ...data}))
							setCurrentSlide(2)
						}}
					/>
					<Slide3
						currentSlide={currentSlide}
						setCanProceed={setCanProceed}
						onComplete={(data) => {
							setFormData((cur) => ({...cur, ...data}))
							setCurrentSlide(3)
						}}
					/>
					<Slide4
						currentSlide={currentSlide}
						setCanProceed={setCanProceed}
						onComplete={(data) => {
							setFormData((cur) => ({...cur, ...data}))
							submitForm({...formData, ...data} as FormInputs).catch((err) => {
								setHasSubmitted(false)
								console.error(err)
							})
						}}
					/>
				</motion.div>
			</div>
			<div className="flex justify-between">
				<Button onClick={() => setCurrentSlide((val) => Math.max(val - 1, 0))} disabled={currentSlide === 0}>
					Previous
				</Button>
				{currentSlide === 3 ? (
					<Button
						key="submit-button"
						type="primary"
						htmlType="submit"
						form="current-slide"
						loading={hasSubmitted}
						disabled={!canProceed}
					>
						Start
					</Button>
				) : (
					<Button
						type="primary"
						htmlType="submit"
						form="current-slide"
						disabled={currentSlide === numSlides - 1 || !canProceed || hasSubmitted}
					>
						Next
					</Button>
				)}
			</div>
		</div>
	)
}

export default ProductSetupClientPage

const numSlides = 4
