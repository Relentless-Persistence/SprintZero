"use client"

import {useQuery} from "@tanstack/react-query"
import {Avatar, Button} from "antd5"
import {addDoc, collection, doc, setDoc} from "firebase9/firestore"
import {motion} from "framer-motion"
import Image from "next/image"
import {useRouter} from "next/navigation"
import {useState} from "react"
import {v4 as uuid} from "uuid"

import type {FC} from "react"
import type {Id} from "~/types"
import type {Product} from "~/types/db/Products"
import type {Version} from "~/types/db/Versions"

import Slide1 from "./Slide1"
import Slide2 from "./Slide2"
import Slide3 from "./Slide3"
import Slide4 from "./Slide4"
import {db} from "~/config/firebase"
import {Products, ProductSchema} from "~/types/db/Products"
import {Versions} from "~/types/db/Versions"
import {getUser} from "~/utils/api/queries"
import {useUserId} from "~/utils/atoms"

const numSlides = 4

type FormInputs = Pick<Product, `cadence` | `effortCost` | `gate` | `name`>

const ProductConfiguration: FC = () => {
	const userId = useUserId()
	const [currentSlide, setCurrentSlide] = useState(0)
	const [canProceed, setCanProceed] = useState(false)
	const [formData, setFormData] = useState<Partial<FormInputs>>({})
	const [hasSubmitted, setHasSubmitted] = useState(false)

	const {data: user} = useQuery({
		queryKey: [`user`, userId],
		queryFn: getUser(userId as Id),
		enabled: userId !== undefined && userId !== `signed-out`,
	})

	const router = useRouter()
	const submitForm = async (data: FormInputs) => {
		if (!userId || !user) return

		setHasSubmitted(true)

		const slug = `${data.name.replaceAll(/[^A-Za-z0-9]/g, ``)}-${uuid().slice(0, 6)}` as Id
		addDoc(collection(db, Versions._), {name: `1.0`, productId: slug} satisfies Omit<Version, `id`>)

		const finalData = ProductSchema.omit({id: true}).parse({
			...data,
			members: {[userId]: {type: `editor`}},
			storyMapState: {epics: [], features: [], stories: [], productId: slug},
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
		} satisfies Omit<Product, `id`>)
		await setDoc(doc(db, Products._, slug), finalData)

		router.push(`/${slug}/dashboard`)
	}

	return (
		<div className="h-full w-full overflow-x-hidden">
			<div className="mx-auto flex h-full max-w-5xl flex-col gap-8 p-8">
				<div className="flex justify-between">
					<Image src="/images/logo_beta_light.png" alt="SprintZero logo" width={178} height={42} priority />
					<div className="flex items-center gap-2">
						<Avatar src={user?.avatar} size="large" alt="Avatar" className="border border-black" />
						<div className="flex w-min flex-col gap-1">
							<p className="font-semibold">{user?.name}</p>
							<p className="text-ellipsis text-[#595959]">{user?.email}</p>
						</div>
					</div>
				</div>
				<div className="flex flex-col gap-2">
					<h1 className="text-3xl">Product Configuration</h1>
					<h2 className="text-xl text-[#595959]">
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
								submitForm({...formData, ...data} as FormInputs)
							}}
						/>
					</motion.div>
				</div>
				<div className="flex justify-between">
					<Button onClick={() => void setCurrentSlide((val) => Math.max(val - 1, 0))} disabled={currentSlide === 0}>
						Previous
					</Button>
					{currentSlide === 3 ? (
						<Button
							key="submit-button"
							type="primary"
							htmlType="submit"
							form="current-slide"
							disabled={!canProceed || hasSubmitted}
							className="bg-green-s500"
						>
							Start
						</Button>
					) : (
						<Button
							type="primary"
							htmlType="submit"
							form="current-slide"
							disabled={currentSlide === numSlides - 1 || !canProceed || hasSubmitted}
							className="bg-green-s500"
						>
							Next
						</Button>
					)}
				</div>
			</div>
		</div>
	)
}

export default ProductConfiguration
