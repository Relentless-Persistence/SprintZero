import {zodResolver} from "@hookform/resolvers/zod"
import {Form} from "antd5"
import {useEffect} from "react"
import {useForm} from "react-hook-form"

import type {FC} from "react"
import type {z} from "zod"

import SlideContainer from "./SlideContainer"
import RhfInput from "~/components/rhf/RhfInput"
import {ProductSchema} from "~/types/db/Products"
import {formValidateStatus} from "~/utils/formValidateStatus"

const formSchema = ProductSchema.pick({name: true})
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
		},
	})

	const onSubmit = handleSubmit((data) => void onComplete(data))

	useEffect(() => void (isActive && setCanProceed(formState.isValid)), [isActive, formState.isValid, setCanProceed])

	return (
		<SlideContainer isActive={isActive}>
			<div className="flex flex-col items-center gap-4">
				<div className="flex flex-col items-center">
					<h3 className="text-2xl font-semibold">Details</h3>
					<p>Please provide information below</p>
				</div>

				<Form id={isActive ? `current-slide` : ``} layout="vertical" requiredMark onFinish={onSubmit}>
					<p className="text-lg font-semibold">Product</p>
					<Form.Item
						required
						extra="32-character limit"
						hasFeedback
						validateStatus={formValidateStatus(getFieldState(`name`, formState))}
						help={formState.errors.name?.message}
					>
						<RhfInput htmlSize={32} maxLength={32} control={control} name="name" />
					</Form.Item>

					<input type="submit" hidden />
				</Form>
			</div>
		</SlideContainer>
	)
}

export default Slide1
