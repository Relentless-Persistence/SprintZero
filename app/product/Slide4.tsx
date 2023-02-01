import {zodResolver} from "@hookform/resolvers/zod"
import {Form} from "antd"
import {useEffect} from "react"
import {useForm} from "react-hook-form"
import {z} from "zod"

import type {FC} from "react"

import SlideContainer from "./SlideContainer"
import RhfInput from "~/components/rhf/RhfInput"
import {formValidateStatus} from "~/utils/formValidateStatus"

const formSchema = z.object({
	effortCost: z
		.string()
		.regex(/(\.[0-9]{2})?/, {message: `Must have two decimal places.`})
		.regex(/^\$[0-9]+(\.[0-9]{2})?$/, `Invalid format.`)
		.nullable(),
})
type FormInputs = z.infer<typeof formSchema>

type Slide4Props = {
	currentSlide: number
	setCanProceed: (canProceed: boolean) => void
	onComplete: (data: {effortCost: number | null}) => void
}

const Slide4: FC<Slide4Props> = ({setCanProceed, currentSlide, onComplete}) => {
	const isActive = currentSlide === 3
	const {control, formState, handleSubmit, getFieldState} = useForm<FormInputs>({
		mode: `onChange`,
		resolver: zodResolver(formSchema),
		defaultValues: {
			effortCost: null,
		},
	})

	const onSubmit = handleSubmit(
		(data) => void onComplete({effortCost: data.effortCost ? parseFloat(data.effortCost.slice(1)) : null}),
	)

	useEffect(() => void (isActive && setCanProceed(formState.isValid)), [isActive, formState.isValid, setCanProceed])

	return (
		<SlideContainer isActive={isActive}>
			<div className="flex flex-col items-center gap-4">
				<div className="flex flex-col items-center">
					<h3 className="text-2xl font-semibold">Effort Cost</h3>
					<p>How much is 1 story point?</p>
				</div>

				<Form id={isActive ? `current-slide` : ``} layout="vertical" onFinish={onSubmit}>
					<Form.Item
						extra="Optional"
						required
						hasFeedback
						validateStatus={formValidateStatus(getFieldState(`effortCost`, formState))}
						help={formState.errors.effortCost?.message}
					>
						<RhfInput currencyFormat placeholder="$0.00" htmlSize={20} control={control} name="effortCost" />
					</Form.Item>

					<input type="submit" hidden />
				</Form>
			</div>
		</SlideContainer>
	)
}

export default Slide4
