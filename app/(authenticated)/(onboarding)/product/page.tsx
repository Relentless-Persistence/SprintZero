"use client"

import {Button} from "antd"
import {addDoc, collection, doc, setDoc} from "firebase/firestore"
import {motion} from "framer-motion"
import {nanoid} from "nanoid"
import {useRouter} from "next/navigation"
import {useState} from "react"
import {useAuthState} from "react-firebase-hooks/auth"
import invariant from "tiny-invariant"

import type {FC} from "react"
import type {Id} from "~/types"
import type {Product} from "~/types/db/Products"
import type {StoryMapState} from "~/types/db/StoryMapStates"
import type {Version} from "~/types/db/Versions"

import Slide1 from "./Slide1"
import Slide2 from "./Slide2"
import Slide3 from "./Slide3"
import Slide4 from "./Slide4"
import {ProductSchema} from "~/types/db/Products"
import {auth, db} from "~/utils/firebase"

const numSlides = 4

type FormInputs = Pick<Product, `cadence` | `effortCost` | `name` | `sprintStartDayOfWeek`>

const ProductSetupPage: FC = () => {
	const [user] = useAuthState(auth)
	invariant(user, `User must be logged in`)
	const [currentSlide, setCurrentSlide] = useState(0)
	const [canProceed, setCanProceed] = useState(false)
	const [formData, setFormData] = useState<Partial<FormInputs>>({})
	const [hasSubmitted, setHasSubmitted] = useState(false)

	const router = useRouter()
	const submitForm = async (data: FormInputs) => {
		if (hasSubmitted) return
		setHasSubmitted(true)

		const slug = `${data.name.replaceAll(/[^A-Za-z0-9]/g, ``)}-${nanoid().slice(0, 6)}` as Id

		const storyMapStateId = (
			await addDoc(collection(db, `StoryMapStates`), {
				items: {},
				productId: slug,
			} satisfies StoryMapState)
		).id as Id

		const finalData = ProductSchema.parse({
			...data,
			storyMapStateId,
			members: {[user.uid as Id]: {type: `editor`}},
			problemStatement: ``,
			personas: [],
			successMetrics: [],
			businessPriorities: [],
			accessibilityMissionStatements: {
				auditory: ``,
				cognitive: ``,
				physical: ``,
				speech: ``,
				visual: ``,
			},
			productType: `mobile`,
			valueProposition: ``,
			features: [],
			finalVision: ``,
			updates: [],
		} satisfies Product)
		await setDoc(doc(db, `Products`, slug), finalData)

		await addDoc(collection(db, `StoryMapStates`, storyMapStateId, `Versions`), {
			name: `1.0`,
		} satisfies Version)

		router.push(`/${slug}/map`)
	}

	return (
		<div className="flex grow flex-col gap-8">
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl">Product Configuration</h1>
				<h2 className="text-xl text-gray">
					Almost time to start building! We just require a few data points before we can begin
				</h2>
			</div>
			<div className="flex w-full grow items-center">
				<div className="shrink-0 basis-[calc(50%-12rem)]" />
				<motion.div
					className="flex h-full max-h-[30rem] w-max gap-24"
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
							submitForm({...formData, ...data} as FormInputs).catch(console.error)
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

export default ProductSetupPage
