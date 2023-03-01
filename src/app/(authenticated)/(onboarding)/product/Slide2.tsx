import {Button} from "antd"
import {useEffect, useState} from "react"

import type {FC} from "react"

import SlideContainer from "./SlideContainer"

export type Slide2Props = {
	currentSlide: number
	setCanProceed: (canProceed: boolean) => void
	onComplete: (data: {cadence: number}) => void
}

const Slide2: FC<Slide2Props> = ({setCanProceed, currentSlide, onComplete}) => {
	const isActive = currentSlide === 1
	const [selection, setSelection] = useState<undefined | 1 | 2 | 3>(undefined)

	useEffect(() => {
		if (isActive) setCanProceed(selection !== undefined)
	}, [isActive, selection, setCanProceed])

	return (
		<SlideContainer isActive={isActive}>
			<div className="flex flex-col items-center gap-4">
				<div className="flex flex-col items-center gap-2">
					<h3 className="text-2xl font-semibold">Cadence</h3>
					<p>How many weeks are allocated?</p>
				</div>

				<form
					id={isActive ? `current-slide` : ``}
					onSubmit={(e) => {
						e.preventDefault()
						onComplete({cadence: selection!})
					}}
					className="flex w-64 flex-col justify-items-stretch gap-4"
				>
					<Button onClick={() => setSelection(1)} type={selection === 1 ? `primary` : `default`}>
						One
					</Button>
					<Button onClick={() => setSelection(2)} type={selection === 2 ? `primary` : `default`}>
						Two
					</Button>
					<Button onClick={() => setSelection(3)} type={selection === 3 ? `primary` : `default`}>
						Three
					</Button>

					<input type="submit" hidden />
				</form>
			</div>
		</SlideContainer>
	)
}

export default Slide2
