"use client"

import {Button} from "antd"
import crypto from "crypto"
import {Timestamp, doc, runTransaction, serverTimestamp, setDoc} from "firebase/firestore"
import {motion} from "framer-motion"
import {nanoid} from "nanoid"
import {useRouter} from "next/navigation"
import querystring from "querystring"
import {useState} from "react"

import type {FC} from "react"
import type {Product} from "~/types/db/Products"

import Slide1 from "./Slide1"
import Slide2 from "./Slide2"
import Slide3 from "./Slide3"
import Slide4 from "./Slide4"
import {ProductConverter} from "~/types/db/Products"
import {InviteConverter} from "~/types/db/Products/Invites"
import {ObjectiveConverter} from "~/types/db/Products/Objectives"
import {StoryMapHistoryConverter} from "~/types/db/Products/StoryMapHistories"
import {VersionConverter} from "~/types/db/Products/Versions"
import {db} from "~/utils/firebase"
import {trpc} from "~/utils/trpc"
import {useUser} from "~/utils/useUser"

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
	const user = useUser()
	const [currentSlide, setCurrentSlide] = useState(0)
	const [canProceed, setCanProceed] = useState(false)
	const [formData, setFormData] = useState<Partial<FormInputs>>({})
	const [hasSubmitted, setHasSubmitted] = useState(false)

	const sendEmail = trpc.sendEmail.useMutation()

	const submitForm = async (_data: FormInputs) => {
		if (hasSubmitted || !user) return
		setHasSubmitted(true)

		let {email1, email2, email3, ...data} = _data
		if (email1 === email2) email2 = null
		if (email1 === email3) email3 = null
		if (email2 === email3) email3 = null
		const members = {[user.id]: {type: `owner`} as const}

		const slug = `${_data.name.replaceAll(/[^A-Za-z0-9]/g, ``)}-${nanoid().slice(0, 6)}`
		// eslint-disable-next-line @typescript-eslint/require-await -- Callback requires Promise return
		await runTransaction(db, async (transaction) => {
			const storyMapHistoryId = nanoid()

			transaction.set(doc(db, `Products`, slug).withConverter(ProductConverter), {
				...data,
				createdAt: Timestamp.now(),
				members,

				storyMapCurrentHistoryId: storyMapHistoryId,
				storyMapUpdatedAt: Timestamp.now(),

				businessOutcomes: [],
				marketLeaders: [],
				potentialRisks: [],
				problemStatement: ``,
				userPriorities: [],

				accessibility: {
					auditory: [false, false, false, false, false],
					cognitive: [false, false, false, false, false, false],
					physical: [false, false, false, false, false],
					speech: [false, false],
					visual: [false, false, false, false, false, false, false, false],
				},

				features: null,
				finalVision: ``,
				productType: `mobile`,
				updates: [],
				valueProposition: null,

				huddles: {
					[user.id]: {
						updatedAt: Timestamp.now(),
						blockerStoryIds: [],
						todayStoryIds: [],
						yesterdayStoryIds: [],
					},
				},
			})

			transaction.set(
				doc(db, `Products`, slug, `StoryMapHistories`, storyMapHistoryId).withConverter(StoryMapHistoryConverter),
				{
					future: false,
					timestamp: serverTimestamp(),
				},
			)

			transaction.set(doc(db, `Products`, slug, `Versions`, nanoid()).withConverter(VersionConverter), {
				deleted: false,
				name: `1.0`,
			})

			transaction.set(doc(db, `Products`, slug, `Objectives`, nanoid()).withConverter(ObjectiveConverter), {
				name: `001`,
				statement: ``,
			})
			transaction.set(doc(db, `Products`, slug, `Objectives`, nanoid()).withConverter(ObjectiveConverter), {
				name: `002`,
				statement: ``,
			})
			transaction.set(doc(db, `Products`, slug, `Objectives`, nanoid()).withConverter(ObjectiveConverter), {
				name: `003`,
				statement: ``,
			})
			transaction.set(doc(db, `Products`, slug, `Objectives`, nanoid()).withConverter(ObjectiveConverter), {
				name: `004`,
				statement: ``,
			})
			transaction.set(doc(db, `Products`, slug, `Objectives`, nanoid()).withConverter(ObjectiveConverter), {
				name: `005`,
				statement: ``,
			})
		})

		for (const recipient of [email1, email2, email3]) {
			if (!recipient) continue

			const inviteToken = crypto.randomBytes(16).toString(`hex`)
			const queryParams = querystring.stringify({invite_token: inviteToken})
			const inviteLink = `https://web.sprintzero.app/sign-in?${queryParams}`
			const body = `<b>${user.data().name}</b> has invited you to join the product <b>"${
				data.name
			}"</b>.<br><br><a href="${inviteLink}">Accept Invitation</a>`

			await setDoc(doc(db, `Products`, slug, `ProductInvites`, inviteToken).withConverter(InviteConverter), {
				email: recipient,
			})

			await sendEmail.mutateAsync({
				to: recipient,
				from: `no-reply@sprintzero.app`,
				subject: `SprintZero | Member Invite`,
				body,
			})
		}

		router.push(`/${slug}/map`)
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
