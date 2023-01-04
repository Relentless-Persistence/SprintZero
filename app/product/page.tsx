"use client"

import {useQuery} from "@tanstack/react-query"
import {Avatar, Button} from "antd5"
import {addDoc, collection, doc, setDoc} from "firebase9/firestore"
import {motion} from "framer-motion"
import {useAtomValue} from "jotai"
import Image from "next/image"
import {useRouter} from "next/navigation"
import {useState} from "react"
import {v4 as uuid} from "uuid"

import type {FC} from "react"

import Slide1 from "./Slide1"
import Slide2 from "./Slide2"
import Slide3 from "./Slide3"
import Slide4 from "./Slide4"
import {db} from "~/config/firebase"
import {Products, ProductSchema} from "~/types/db/Products"
import {Version, Versions} from "~/types/db/Versions"
import {userIdAtom} from "~/utils/atoms"
import {getUser} from "~/utils/fetch"

const numSlides = 4

type FormInputs = {
	cadence: number
	effortCost: number | null
	email1: string | null
	email2: string | null
	email3: string | null
	gate: `Monday` | `Tuesday` | `Wednesday` | `Thursday` | `Friday` | `Saturday` | `Sunday`
	name: string
}

const ProductConfiguration: FC = () => {
	const userId = useAtomValue(userIdAtom)
	const [currentSlide, setCurrentSlide] = useState(0)
	const [canProceed, setCanProceed] = useState(false)
	const [formData, setFormData] = useState<Partial<FormInputs>>({})
	const [hasSubmitted, setHasSubmitted] = useState(false)

	const {data: user} = useQuery({
		queryKey: [`user`, userId],
		queryFn: getUser(userId!),
		enabled: userId !== null,
	})

	const router = useRouter()
	const submitForm = async (data: FormInputs) => {
		setHasSubmitted(true)
		const slug = `${data.name.replaceAll(/[^A-Za-z0-9]/g, ``)}-${uuid().slice(0, 6)}`
		const finalData = ProductSchema.omit({id: true, updatedAt: true}).parse({...data, owner: userId})
		await setDoc(doc(db, Products._, slug), finalData)

		// await addDoc(collection(db, Versions._), {name} satisfies Version)
		router.push(`/${slug}/dashboard`)
	}

	return (
		<div className="h-full w-full overflow-hidden">
			<div className="mx-auto flex h-full max-w-5xl flex-col gap-8 p-12">
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
					<h1 className="text-4xl">Product Configuration</h1>
					<h2 className="text-2xl text-[#595959]">
						Almost time to start building! We just require a few data points before we can begin
					</h2>
				</div>
				<div className="flex w-full grow items-center">
					<div className="shrink-0 basis-[calc(50%-12rem)]" />
					<motion.div
						className="flex h-full max-h-[34rem] w-max gap-24"
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
		</div>
	)
}

export default ProductConfiguration
