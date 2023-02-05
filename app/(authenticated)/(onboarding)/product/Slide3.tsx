import {zodResolver} from "@hookform/resolvers/zod"
import {Form} from "antd"
import clsx from "clsx"
import {useEffect} from "react"
import {useForm, useWatch} from "react-hook-form"
import {z} from "zod"

import type {FC} from "react"

import SlideContainer from "./SlideContainer"

const formSchema = z.object({
	sprintStartDayOfWeek: z.enum([`0`, `1`, `2`, `3`, `4`, `5`, `6`]),
})
type FormInputs = z.infer<typeof formSchema>

export type Slide3Props = {
	currentSlide: number
	setCanProceed: (canProceed: boolean) => void
	onComplete: (data: {sprintStartDayOfWeek: number}) => void
}

const Slide3: FC<Slide3Props> = ({setCanProceed, currentSlide, onComplete}) => {
	const isActive = currentSlide === 2
	const {register, formState, handleSubmit, control} = useForm<FormInputs>({
		mode: `onChange`,
		resolver: zodResolver(formSchema),
	})

	const onSubmit = handleSubmit((data) => void onComplete({sprintStartDayOfWeek: parseInt(data.sprintStartDayOfWeek)}))

	useEffect(() => void (isActive && setCanProceed(formState.isValid)), [isActive, formState.isValid, setCanProceed])

	const sprintStartDayOfWeek = useWatch({control, name: `sprintStartDayOfWeek`})

	return (
		<SlideContainer isActive={isActive}>
			<div className="flex flex-col items-center gap-4">
				<div className="flex flex-col items-center">
					<h3 className="text-2xl font-semibold">Gate</h3>
					<p>Which day would you like to begin your sprints?</p>
				</div>

				<Form id={isActive ? `current-slide` : ``} onFinish={onSubmit}>
					<Form.Item>
						<div className="flex flex-col gap-4">
							<input
								type="radio"
								{...register(`sprintStartDayOfWeek`)}
								value="1"
								hidden
								id="gate-monday"
								className="appearance-none"
							/>
							<label
								htmlFor="gate-monday"
								className={clsx(
									`w-32 border px-3 py-1 text-center transition-colors`,
									sprintStartDayOfWeek === `1`
										? `border-green bg-green text-white shadow-md`
										: `border-[#d9d9d9] bg-white shadow-sm`,
								)}
							>
								Monday
							</label>
							<input
								type="radio"
								{...register(`sprintStartDayOfWeek`)}
								value="2"
								hidden
								id="gate-tuesday"
								className="appearance-none"
							/>
							<label
								htmlFor="gate-tuesday"
								className={clsx(
									`w-32 border px-3 py-1 text-center transition-colors`,
									sprintStartDayOfWeek === `2`
										? `border-green bg-green text-white shadow-md`
										: `border-[#d9d9d9] bg-white shadow-sm`,
								)}
							>
								Tuesday
							</label>
							<input
								type="radio"
								{...register(`sprintStartDayOfWeek`)}
								value="3"
								hidden
								id="gate-wednesday"
								className="appearance-none"
							/>
							<label
								htmlFor="gate-wednesday"
								className={clsx(
									`w-32 border px-3 py-1 text-center transition-colors`,
									sprintStartDayOfWeek === `3`
										? `border-green bg-green text-white shadow-md`
										: `border-[#d9d9d9] bg-white shadow-sm`,
								)}
							>
								Wednesday
							</label>
							<input
								type="radio"
								{...register(`sprintStartDayOfWeek`)}
								value="4"
								hidden
								id="gate-thursday"
								className="appearance-none"
							/>
							<label
								htmlFor="gate-thursday"
								className={clsx(
									`w-32 border px-3 py-1 text-center transition-colors`,
									sprintStartDayOfWeek === `4`
										? `border-green bg-green text-white shadow-md`
										: `border-[#d9d9d9] bg-white shadow-sm`,
								)}
							>
								Thursday
							</label>
							<input
								type="radio"
								{...register(`sprintStartDayOfWeek`)}
								value="5"
								hidden
								id="gate-friday"
								className="appearance-none"
							/>
							<label
								htmlFor="gate-friday"
								className={clsx(
									`w-32 border px-3 py-1 text-center transition-colors`,
									sprintStartDayOfWeek === `5`
										? `border-green bg-green text-white shadow-md`
										: `border-[#d9d9d9] bg-white shadow-sm`,
								)}
							>
								Friday
							</label>
							<input
								type="radio"
								{...register(`sprintStartDayOfWeek`)}
								value="6"
								hidden
								id="gate-saturday"
								className="appearance-none"
							/>
							<label
								htmlFor="gate-saturday"
								className={clsx(
									`w-32 border px-3 py-1 text-center transition-colors`,
									sprintStartDayOfWeek === `6`
										? `border-green bg-green text-white shadow-md`
										: `border-[#d9d9d9] bg-white shadow-sm`,
								)}
							>
								Saturday
							</label>
							<input
								type="radio"
								{...register(`sprintStartDayOfWeek`)}
								value="0"
								hidden
								id="gate-sunday"
								className="appearance-none"
							/>
							<label
								htmlFor="gate-sunday"
								className={clsx(
									`w-32 border px-3 py-1 text-center transition-colors`,
									sprintStartDayOfWeek === `0`
										? `border-green bg-green text-white shadow-md`
										: `border-[#d9d9d9] bg-white shadow-sm`,
								)}
							>
								Sunday
							</label>
						</div>
					</Form.Item>

					<input type="submit" hidden />
				</Form>
			</div>
		</SlideContainer>
	)
}

export default Slide3
