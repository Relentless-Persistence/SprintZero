import {Button} from "antd"
import {useEffect, useState} from "react"

import type {FC} from "react"
import type {z} from "zod"

import SlideContainer from "./SlideContainer"
import {ProductSchema} from "~/types/db/Products"

const formSchema = ProductSchema.pick({sprintStartDayOfWeek: true})
type FormInputs = z.infer<typeof formSchema>

export type Slide3Props = {
	currentSlide: number
	setCanProceed: (canProceed: boolean) => void
	onComplete: (data: {sprintStartDayOfWeek: number}) => void
}

const Slide3: FC<Slide3Props> = ({setCanProceed, currentSlide, onComplete}) => {
	const isActive = currentSlide === 2
	const [selection, setSelection] = useState<FormInputs[`sprintStartDayOfWeek`] | undefined>(undefined)

	useEffect(() => {
		if (isActive) setCanProceed(selection !== undefined)
	}, [isActive, selection, setCanProceed])

	return (
		<SlideContainer isActive={isActive}>
			<div className="flex flex-col items-center gap-4">
				<div className="flex flex-col items-center gap-2">
					<h3 className="text-2xl font-semibold">Gate</h3>
					<p>Which day would you like to begin your sprints?</p>
				</div>

				<form
					id={isActive ? `current-slide` : ``}
					onSubmit={(e) => {
						e.preventDefault()
						onComplete({sprintStartDayOfWeek: selection!})
					}}
					className="flex w-64 flex-col justify-items-center gap-4"
				>
					<Button onClick={() => setSelection(1)} type={selection === 1 ? `primary` : `default`}>
						Monday
					</Button>
					<Button onClick={() => setSelection(2)} type={selection === 2 ? `primary` : `default`}>
						Tuesday
					</Button>
					<Button onClick={() => setSelection(3)} type={selection === 3 ? `primary` : `default`}>
						Wednesday
					</Button>
					<Button onClick={() => setSelection(4)} type={selection === 4 ? `primary` : `default`}>
						Thursday
					</Button>
					<Button onClick={() => setSelection(5)} type={selection === 5 ? `primary` : `default`}>
						Friday
					</Button>

					<input type="submit" hidden />
				</form>
			</div>
		</SlideContainer>
	)
}

export default Slide3
