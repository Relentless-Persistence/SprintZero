import {zodResolver} from "@hookform/resolvers/zod"
import {Form} from "antd5"
import clsx from "clsx"
import {useEffect} from "react"
import {useForm, useWatch} from "react-hook-form"
import {z} from "zod"

import type {FC} from "react"

import SlideContainer from "./SlideContainer"

const schema = z.object({
	gate: z.union([
		z.literal(`Monday`),
		z.literal(`Tuesday`),
		z.literal(`Wednesday`),
		z.literal(`Thursday`),
		z.literal(`Friday`),
		z.literal(`Saturday`),
		z.literal(`Sunday`),
	]),
})
type FormInputs = z.infer<typeof schema>

export type Slide3Props = {
	currentSlide: number
	setCanProceed: (canProceed: boolean) => void
	onComplete: (data: FormInputs) => void
}

const Slide3: FC<Slide3Props> = ({setCanProceed, currentSlide, onComplete}) => {
	const isActive = currentSlide === 2
	const {register, formState, handleSubmit, control} = useForm<FormInputs>({
		mode: `onChange`,
		resolver: zodResolver(schema),
	})

	const onSubmit = handleSubmit((data) => void onComplete(data))

	useEffect(() => void (isActive && setCanProceed(formState.isValid)), [isActive, formState.isValid, setCanProceed])

	const gate = useWatch({control, name: `gate`})

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
								{...register(`gate`)}
								value="Monday"
								hidden
								id="gate-monday"
								className="appearance-none"
							/>
							<label
								htmlFor="gate-monday"
								className={clsx(
									`w-32 border px-3 py-1 text-center transition-colors`,
									gate === `Monday`
										? `border-green-s500 bg-green-s500 text-white shadow-md`
										: `border-[#d9d9d9] bg-white shadow-sm`,
								)}
							>
								Monday
							</label>
							<input
								type="radio"
								{...register(`gate`)}
								value="Tuesday"
								hidden
								id="gate-tuesday"
								className="appearance-none"
							/>
							<label
								htmlFor="gate-tuesday"
								className={clsx(
									`w-32 border px-3 py-1 text-center transition-colors`,
									gate === `Tuesday`
										? `border-green-s500 bg-green-s500 text-white shadow-md`
										: `border-[#d9d9d9] bg-white shadow-sm`,
								)}
							>
								Tuesday
							</label>
							<input
								type="radio"
								{...register(`gate`)}
								value="Wednesday"
								hidden
								id="gate-wednesday"
								className="appearance-none"
							/>
							<label
								htmlFor="gate-wednesday"
								className={clsx(
									`w-32 border px-3 py-1 text-center transition-colors`,
									gate === `Wednesday`
										? `border-green-s500 bg-green-s500 text-white shadow-md`
										: `border-[#d9d9d9] bg-white shadow-sm`,
								)}
							>
								Wednesday
							</label>
							<input
								type="radio"
								{...register(`gate`)}
								value="Thursday"
								hidden
								id="gate-thursday"
								className="appearance-none"
							/>
							<label
								htmlFor="gate-thursday"
								className={clsx(
									`w-32 border px-3 py-1 text-center transition-colors`,
									gate === `Thursday`
										? `border-green-s500 bg-green-s500 text-white shadow-md`
										: `border-[#d9d9d9] bg-white shadow-sm`,
								)}
							>
								Thursday
							</label>
							<input
								type="radio"
								{...register(`gate`)}
								value="Friday"
								hidden
								id="gate-friday"
								className="appearance-none"
							/>
							<label
								htmlFor="gate-friday"
								className={clsx(
									`w-32 border px-3 py-1 text-center transition-colors`,
									gate === `Friday`
										? `border-green-s500 bg-green-s500 text-white shadow-md`
										: `border-[#d9d9d9] bg-white shadow-sm`,
								)}
							>
								Friday
							</label>
							<input
								type="radio"
								{...register(`gate`)}
								value="Saturday"
								hidden
								id="gate-saturday"
								className="appearance-none"
							/>
							<label
								htmlFor="gate-saturday"
								className={clsx(
									`w-32 border px-3 py-1 text-center transition-colors`,
									gate === `Saturday`
										? `border-green-s500 bg-green-s500 text-white shadow-md`
										: `border-[#d9d9d9] bg-white shadow-sm`,
								)}
							>
								Saturday
							</label>
							<input
								type="radio"
								{...register(`gate`)}
								value="Sunday"
								hidden
								id="gate-sunday"
								className="appearance-none"
							/>
							<label
								htmlFor="gate-sunday"
								className={clsx(
									`w-32 border px-3 py-1 text-center transition-colors`,
									gate === `Sunday`
										? `border-green-s500 bg-green-s500 text-white shadow-md`
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
