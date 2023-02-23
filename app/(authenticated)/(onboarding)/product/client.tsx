"use client"

import {Button} from "antd"
import axios from "axios"
import {addDoc, collection, doc, serverTimestamp, setDoc, updateDoc} from "firebase/firestore"
import {motion} from "framer-motion"
import {nanoid} from "nanoid"
import {useRouter} from "next/navigation"
import {useState} from "react"
import {useAuthState} from "react-firebase-hooks/auth"
import invariant from "tiny-invariant"

import type {FC} from "react"
import type {Id} from "~/types"
import type {Product} from "~/types/db/Products"

import Slide1 from "./Slide1"
import Slide2 from "./Slide2"
import Slide3 from "./Slide3"
import Slide4 from "./Slide4"
import {HistoryConverter} from "~/types/db/Histories"
import {ObjectiveConverter} from "~/types/db/Objectives"
import {ProductConverter} from "~/types/db/Products"
import {StoryMapStateConverter} from "~/types/db/StoryMapStates"
import {VersionConverter} from "~/types/db/Versions"
import {auth, db} from "~/utils/firebase"

const ProductSetupClientPage: FC = () => {
	const [user] = useAuthState(auth)
	invariant(user, `User must be logged in`)
	const [currentSlide, setCurrentSlide] = useState(0)
	const [canProceed, setCanProceed] = useState(false)
	const [formData, setFormData] = useState<Partial<FormInputs>>({})
	const [hasSubmitted, setHasSubmitted] = useState(false)

	const router = useRouter()

	const sendEmailInvites = async (recipients: (string | null)[]) => {
		const from = `no-reply@sprintzero.app`
		const subject = `You are invited to join SprintZero`
		const body = `Dummy invite email text. If you've received this email, it means the email inivite is now working when onboarding.`

		for (const recipient of recipients) {
			if (!recipient) continue

			const payload: EmailRequest = {
				to: recipient,
				from,
				subject: `${subject}`,
				body: `${body}`,
			}

			try {
				await axios.post(`/api/emails/send`, payload)
				console.log(`Email sent successfully to ${recipient}!`)
			} catch (error) {
				console.error(`Error sending email to ${recipient}:`, error)
			}
		}
	}

	const submitForm = async (_data: FormInputs) => {
		if (hasSubmitted) return
		setHasSubmitted(true)

		const slug = `${_data.name.replaceAll(/[^A-Za-z0-9]/g, ``)}-${nanoid().slice(0, 6)}` as Id

		const storyMapState = await addDoc(collection(db, `StoryMapStates`).withConverter(StoryMapStateConverter), {
			items: {},
			updatedAt: serverTimestamp(),
			currentHistoryId: `` as Id,
			productId: slug,
		})

		const {email1, email2, email3, ...data} = _data
		const members = {[user.uid as Id]: {type: `editor`} as const}
		if (email1) members[email1] = {type: `editor`} as const
		if (email2) members[email2] = {type: `editor`} as const
		if (email3) members[email3] = {type: `editor`} as const

		await setDoc(doc(db, `Products`, slug).withConverter(ProductConverter), {
			...data,
			members,
			problemStatement: ``,
			businessOutcomes: [],
			marketLeaders: [],
			potentialRisks: [],
			userPriorities: [],
			accessibility: {
				auditory: [false, false, false, false, false],
				cognitive: [false, false, false, false, false, false],
				physical: [false, false, false, false, false],
				speech: [false, false],
				visual: [false, false, false, false, false, false, false, false],
			},
			productType: `mobile`,
			valueProposition: ``,
			features: [],
			finalVision: ``,
			updates: [],
		})

		await Promise.all([
			(async () => {
				const positionHistory = await addDoc(
					collection(db, `StoryMapStates`, storyMapState.id, `Histories`).withConverter(HistoryConverter),
					{
						future: false,
						items: {},
						timestamp: serverTimestamp(),
					},
				)
				await updateDoc(storyMapState, {
					currentHistoryId: positionHistory.id as Id,
				})
			})(),
			addDoc(collection(db, `StoryMapStates`, storyMapState.id, `Versions`).withConverter(VersionConverter), {
				name: `1.0`,
			}),
			addDoc(collection(db, `Objectives`).withConverter(ObjectiveConverter), {
				name: `001`,
				statement: ``,
				productId: slug,
			}),
			addDoc(collection(db, `Objectives`).withConverter(ObjectiveConverter), {
				name: `002`,
				statement: ``,
				productId: slug,
			}),
			addDoc(collection(db, `Objectives`).withConverter(ObjectiveConverter), {
				name: `003`,
				statement: ``,
				productId: slug,
			}),
			addDoc(collection(db, `Objectives`).withConverter(ObjectiveConverter), {
				name: `004`,
				statement: ``,
				productId: slug,
			}),
			addDoc(collection(db, `Objectives`).withConverter(ObjectiveConverter), {
				name: `005`,
				statement: ``,
				productId: slug,
			}),
		])

		await sendEmailInvites([email1, email2, email3])

		router.push(`/${slug}/map`)
	}

	return (
		<div className="flex h-full flex-col gap-8">
			<div>
				<h1 className="text-3xl font-semibold">Product Configuration</h1>
				<h2 className="text-xl text-gray">
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
						className="bg-green"
					>
						Start
					</Button>
				) : (
					<Button
						type="primary"
						htmlType="submit"
						form="current-slide"
						disabled={currentSlide === numSlides - 1 || !canProceed || hasSubmitted}
						className="bg-green"
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

type FormInputs = Pick<
	Product,
	`cadence` | `effortCost` | `effortCostCurrencySymbol` | `name` | `sprintStartDayOfWeek`
> & {
	email1: string | null
	email2: string | null
	email3: string | null
}

type EmailRequest = {
	to: string
	from: string
	subject: string
	body: string
	attachments?: string[]
}
