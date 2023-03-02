import {zodResolver} from "@hookform/resolvers/zod"
import {useEffect} from "react"
import {useForm} from "react-hook-form"
import {z} from "zod"

import type {FC} from "react"

import SlideContainer from "./SlideContainer"
import RhfInput from "~/components/rhf/RhfInput"
import {ProductSchema} from "~/types/db/Products"

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
	const {control, formState, handleSubmit} = useForm<FormInputs>({
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
				<div className="flex flex-col items-center leading-normal">
					<h3 className="text-xl font-semibold">Details</h3>
					<p className="text-textTertiary">Please provide information below</p>
				</div>

				<form
					id={isActive ? `current-slide` : ``}
					onSubmit={(e) => {
						onSubmit(e).catch(console.error)
					}}
					className="flex flex-col gap-4"
				>
					<label className="flex flex-col leading-normal">
						<span className="mb-1 text-lg font-semibold">Product name</span>
						<RhfInput
							htmlSize={32}
							maxLength={32}
							control={control}
							name="name"
							disabled={!isActive}
							placeholder="e.g., Netflix, Headspace, Spotify"
						/>
						<p className="text-textTertiary">32-character limit</p>
					</label>

					<div className="flex flex-col gap-2 leading-normal">
						<p className="text-lg font-semibold">Team members</p>
						<RhfInput
							htmlSize={32}
							control={control}
							name="email1"
							disabled={!isActive}
							addonBefore="Email"
							placeholder="username@domain.com"
						/>
						<RhfInput
							htmlSize={32}
							control={control}
							name="email2"
							disabled={!isActive}
							addonBefore="Email"
							placeholder="username@domain.com"
						/>
						<RhfInput
							htmlSize={32}
							control={control}
							name="email3"
							disabled={!isActive}
							addonBefore="Email"
							placeholder="username@domain.com"
						/>
					</div>

					<input type="submit" hidden />
				</form>
			</div>
		</SlideContainer>
	)
}

export default Slide1
