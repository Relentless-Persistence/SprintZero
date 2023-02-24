import {zodResolver} from "@hookform/resolvers/zod"
import {Form} from "antd"
import {useEffect} from "react"
import {useForm} from "react-hook-form"
import {z} from "zod"

import type {FC} from "react"

import SlideContainer from "./SlideContainer"
import RhfInput from "~/components/rhf/RhfInput"
import {ProductSchema} from "~/types/db/Products"
import {formValidateStatus} from "~/utils/formValidateStatus"

const formSchema = ProductSchema.pick({name: true}).extend({
	email1: z.string().email().nullable(),
	email2: z.string().email().nullable(),
	email3: z.string().email().nullable(),
})
type FormInputs = z.infer<typeof formSchema>

export type Slide1Props = {
	currentSlide: number
	setCanProceed: (canProceed: boolean) => void
	onComplete: (data: FormInputs) => void
}

const Slide1: FC<Slide1Props> = ({setCanProceed, currentSlide, onComplete}) => {
	const isActive = currentSlide === 0
	const {control, formState, getFieldState, handleSubmit} = useForm<FormInputs>({
		mode: `onChange`,
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: ``,
			email1: null,
			email2: null,
			email3: null,
		},
	})

	const onSubmit = handleSubmit((data) => onComplete(data))

	useEffect(() => {
		if (isActive) setCanProceed(formState.isValid)
	}, [isActive, formState.isValid, setCanProceed])

	return (
		<SlideContainer isActive={isActive}>
			<div className="flex flex-col items-center gap-4">
				<div className="flex flex-col items-center">
					<h3 className="text-2xl font-semibold">Details</h3>
					<p className="text-textTertiary">Please provide information below</p>
				</div>

				<Form
					id={isActive ? `current-slide` : ``}
					layout="vertical"
					requiredMark
					onFinish={() => {
						onSubmit().catch(console.error)
					}}
				>
					<div className="flex flex-col gap-4">
						<Form.Item
							required
							extra="32-character limit"
							hasFeedback
							validateStatus={formValidateStatus(getFieldState(`name`, formState))}
							help={formState.errors.name?.message}
						>
							<p className="mb-1 text-lg font-semibold">Product name</p>
							<RhfInput
								htmlSize={32}
								maxLength={32}
								control={control}
								name="name"
								placeholder="e.g., Netflix, Headspace, Spotify"
							/>
						</Form.Item>

						<div>
							<p className="mb-1 text-lg font-semibold">Team members</p>
							<div className="flex flex-col gap-2">
								<Form.Item
									required
									hasFeedback
									validateStatus={formValidateStatus(getFieldState(`email1`, formState))}
									help={formState.errors.email1?.message}
								>
									<RhfInput
										htmlSize={32}
										maxLength={32}
										control={control}
										name="email1"
										addonBefore="Email"
										placeholder="username@domain.com"
									/>
								</Form.Item>
								<Form.Item
									required
									hasFeedback
									validateStatus={formValidateStatus(getFieldState(`email2`, formState))}
									help={formState.errors.email2?.message}
								>
									<RhfInput
										htmlSize={32}
										maxLength={32}
										control={control}
										name="email2"
										addonBefore="Email"
										placeholder="username@domain.com"
									/>
								</Form.Item>
								<Form.Item
									required
									hasFeedback
									validateStatus={formValidateStatus(getFieldState(`email3`, formState))}
									help={formState.errors.email3?.message}
								>
									<RhfInput
										htmlSize={32}
										maxLength={32}
										control={control}
										name="email3"
										addonBefore="Email"
										placeholder="username@domain.com"
									/>
								</Form.Item>
							</div>
						</div>

						<input type="submit" hidden />
					</div>
				</Form>
			</div>
		</SlideContainer>
	)
}

export default Slide1
