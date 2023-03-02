import {zodResolver} from "@hookform/resolvers/zod"
import {useEffect} from "react"
import {useForm} from "react-hook-form"
import {z} from "zod"

import type {FC} from "react"
import type {Promisable} from "type-fest"

import SlideContainer from "./SlideContainer"
import RhfInput from "~/components/rhf/RhfInput"
import RhfSelect from "~/components/rhf/RhfSelect"
import {ProductSchema} from "~/types/db/Products"

const formSchema = ProductSchema.pick({effortCostCurrencySymbol: true}).extend({
	effortCost: z
		.string()
		.regex(/^(\.[0-9]{1,2}|([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.[0-9]{0,2})?)$/, `Invalid format.`)
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
	const {control, formState, handleSubmit} = useForm<FormInputs>({
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
				<div className="flex flex-col items-center leading-normal">
					<h3 className="text-xl font-semibold">Effort Cost</h3>
					<p className="text-textTertiary">How much is a single story point?</p>
				</div>

				<form
					id={isActive ? `current-slide` : ``}
					onSubmit={(e) => {
						onSubmit(e).catch(console.error)
					}}
					className="w-64"
				>
					<label className="flex flex-col gap-1 leading-normal">
						<span>
							Amount <span className="text-textTertiary">(optional)</span>
						</span>
						<RhfInput
							control={control}
							name="effortCost"
							number="currency"
							placeholder="0.00"
							disabled={!isActive}
							addonAfter={
								<RhfSelect
									control={control}
									name="effortCostCurrencySymbol"
									disabled={!isActive}
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
					</label>

					<input type="submit" hidden />
				</form>
			</div>
		</SlideContainer>
	)
}

export default Slide4
