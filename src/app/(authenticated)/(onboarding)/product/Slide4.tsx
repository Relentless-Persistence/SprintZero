import {zodResolver} from "@hookform/resolvers/zod"
import {Form} from "antd"
import {useEffect} from "react"
import {useForm} from "react-hook-form"
import {z} from "zod"

import type {FC} from "react"
import type {Promisable} from "type-fest"

import SlideContainer from "./SlideContainer"
import RhfInput from "~/components/rhf/RhfInput"
import RhfSelect from "~/components/rhf/RhfSelect"
import {ProductSchema} from "~/types/db/Products"
import {formValidateStatus} from "~/utils/formValidateStatus"

const formSchema = ProductSchema.pick({effortCostCurrencySymbol: true}).extend({
	effortCost: z
		.string()
		.regex(/^([0-9],?)+(\.[0-9]?[0-9]?)?$/, `Invalid format.`)
		.nullable(),
})
type FormInputs = z.infer<typeof formSchema>

type Slide4Props = {
	currentSlide: number
	setCanProceed: (canProceed: boolean) => void
	onComplete: (data: Pick<FormInputs, `effortCostCurrencySymbol`> & {effortCost: number | null}) => Promisable<void>
}

const Slide4: FC<Slide4Props> = ({setCanProceed, currentSlide, onComplete}) => {
	const isActive = currentSlide === 3
	const {control, formState, handleSubmit, getFieldState} = useForm<FormInputs>({
		mode: `onChange`,
		resolver: zodResolver(formSchema),
		defaultValues: {
			effortCost: null,
			effortCostCurrencySymbol: `dollar`,
		},
	})

	const onSubmit = handleSubmit((data) =>
		onComplete({
			effortCost: data.effortCost ? parseFloat(data.effortCost.slice(1)) : null,
			effortCostCurrencySymbol: data.effortCostCurrencySymbol,
		}),
	)

	useEffect(() => {
		if (isActive) setCanProceed(formState.isValid)
	}, [isActive, formState.isValid, setCanProceed])

	return (
		<SlideContainer isActive={isActive}>
			<div className="flex flex-col items-center gap-4">
				<div className="flex flex-col items-center">
					<h3 className="text-2xl font-semibold">Effort Cost</h3>
					<p>How much is 1 story point?</p>
				</div>

				<Form
					id={isActive ? `current-slide` : ``}
					layout="vertical"
					requiredMark="optional"
					onFinish={() => {
						onSubmit().catch(console.error)
					}}
				>
					<Form.Item
						label="Amount"
						hasFeedback
						validateStatus={formValidateStatus(getFieldState(`effortCost`, formState))}
						help={formState.errors.effortCost?.message}
						className="w-64"
					>
						<RhfInput
							number="currency"
							placeholder="0.00"
							htmlSize={20}
							control={control}
							name="effortCost"
							addonAfter={
								<RhfSelect
									control={control}
									name="effortCostCurrencySymbol"
									options={[
										{label: `$`, value: `dollar`},
										{label: `£`, value: `pound`},
										{label: `€`, value: `euro`},
										{label: `¥`, value: `yen`},
										{label: `₹`, value: `rupee`},
									]}
								/>
							}
						/>
					</Form.Item>

					<input type="submit" hidden />
				</Form>
			</div>
		</SlideContainer>
	)
}

export default Slide4
