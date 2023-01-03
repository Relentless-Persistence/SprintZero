"use client"

import {useQuery} from "@tanstack/react-query"
import {Avatar, Button} from "antd5"
import {motion} from "framer-motion"
import {useAtomValue} from "jotai"
import {clamp} from "lodash"
import Image from "next/image"
import {useState} from "react"
import {useForm} from "react-hook-form"

import type {FormInputs} from "./types"
import type {FC} from "react"

import Slide1 from "./Slide1"
import Slide2 from "./Slide2"
import Slide3 from "./Slide3"
import Slide4 from "./Slide4"
import SlideContainer from "./SlideContainer"
import {userIdAtom} from "~/utils/atoms"
import {getUser} from "~/utils/fetch"

const ProductConfiguration: FC = () => {
	const userId = useAtomValue(userIdAtom)
	const [currentSlide, setCurrentSlide] = useState(0)

	const {data: user} = useQuery({
		queryKey: [`user`, userId],
		queryFn: getUser(userId!),
		enabled: userId !== null,
	})

	const form = useForm<FormInputs>()

	return (
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
			<div className="flex w-full grow items-center overflow-visible">
				<div className="shrink-0 basis-[calc(50%-12rem)]" />
				<motion.div className="flex h-full max-h-[36rem] w-max gap-24" animate={{x: `calc(-${currentSlide} * 30rem)`}}>
					<SlideContainer currentSlide={currentSlide} slideNumber={0}>
						<Slide1 form={form} />
					</SlideContainer>
					<SlideContainer currentSlide={currentSlide} slideNumber={1}>
						<Slide2 form={form} />
					</SlideContainer>
					<SlideContainer currentSlide={currentSlide} slideNumber={2}>
						<Slide3 />
					</SlideContainer>
					<SlideContainer currentSlide={currentSlide} slideNumber={3}>
						<Slide4 />
					</SlideContainer>
				</motion.div>
			</div>
			<div className="flex justify-between">
				<Button onClick={() => void setCurrentSlide((val) => clamp(val - 1, 0, 3))} disabled={currentSlide === 0}>
					Previous
				</Button>
				{currentSlide === 3 ? (
					<Button htmlType="submit" type="primary">
						Start
					</Button>
				) : (
					<Button
						type="primary"
						onClick={() => void setCurrentSlide((val) => clamp(val + 1, 0, 3))}
						disabled={currentSlide === 3}
					>
						Next
					</Button>
				)}
			</div>
		</div>
	)
}

export default ProductConfiguration
