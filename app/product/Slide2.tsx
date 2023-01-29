import {zodResolver} from "@hookform/resolvers/zod"
import {Form} from "antd5"
import clsx from "clsx"
import {useEffect} from "react"
import {useForm, useWatch} from "react-hook-form"
import {z} from "zod"

import type {FC} from "react"

import SlideContainer from "./SlideContainer"

const formSchema = z.object({
	cadence: z.union([z.literal(`1`), z.literal(`2`), z.literal(`3`)]),
})
type FormInputs = z.infer<typeof formSchema>

export type Slide2Props = {
	currentSlide: number
	setCanProceed: (canProceed: boolean) => void
	onComplete: (data: {cadence: number}) => void
}

const Slide2: FC<Slide2Props> = ({setCanProceed, currentSlide, onComplete}) => {
	const isActive = currentSlide === 1
	const {register, formState, handleSubmit, control} = useForm<FormInputs>({
		mode: `onChange`,
		resolver: zodResolver(formSchema),
	})

	const onSubmit = handleSubmit((data) => void onComplete({cadence: parseInt(data.cadence)}))

	useEffect(() => void (isActive && setCanProceed(formState.isValid)), [isActive, formState.isValid, setCanProceed])

	const cadence = useWatch({control, name: `cadence`})

	return (
		<SlideContainer isActive={isActive}>
			<div className="flex flex-col items-center gap-4">
				<div className="flex flex-col items-center">
					<h3 className="text-2xl font-semibold">Cadence</h3>
					<p>How many weeks will you spend on each sprint?</p>
				</div>

				<Form id={isActive ? `current-slide` : ``} onFinish={onSubmit}>
					<Form.Item>
						<div className="flex flex-col gap-4">
							<input
								type="radio"
								{...register(`cadence`)}
								value="1"
								hidden
								id="cadence-1"
								className="appearance-none"
							/>
							<label
								htmlFor="cadence-1"
								className={clsx(
									`w-32 border px-3 py-1 text-center transition-colors`,
									cadence === `1`
										? `border-green-s500 bg-green-s500 text-white shadow-md`
										: `border-[#d9d9d9] bg-white shadow-sm`,
								)}
							>
								One Week
							</label>
							<input
								type="radio"
								{...register(`cadence`)}
								value="2"
								hidden
								id="cadence-2"
								className="appearance-none"
							/>
							<label
								htmlFor="cadence-2"
								className={clsx(
									`w-32 border px-3 py-1 text-center transition-colors`,
									cadence === `2`
										? `border-green-s500 bg-green-s500 text-white shadow-md`
										: `border-[#d9d9d9] bg-white shadow-sm`,
								)}
							>
								Two Weeks
							</label>
							<input
								type="radio"
								{...register(`cadence`)}
								value="3"
								hidden
								id="cadence-3"
								className="appearance-none"
							/>
							<label
								htmlFor="cadence-3"
								className={clsx(
									`w-32 border px-3 py-1 text-center transition-colors`,
									cadence === `3`
										? `border-green-s500 bg-green-s500 text-white shadow-md`
										: `border-[#d9d9d9] bg-white shadow-sm`,
								)}
							>
								Three Weeks
							</label>
						</div>
					</Form.Item>

					<input type="submit" hidden />
				</Form>
			</div>
		</SlideContainer>
	)
}

export default Slide2
