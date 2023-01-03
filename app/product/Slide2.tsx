import {Button, Form} from "antd5"

import type {FormInputs} from "./types"
import type {FC} from "react"
import type {UseFormReturn} from "react-hook-form"

export type Slide2Props = {
	form: UseFormReturn<FormInputs>
}

const Slide2: FC<Slide2Props> = ({form: {register}}) => {
	return (
		<div className="flex flex-col items-center gap-4">
			<div className="flex flex-col items-center">
				<h3 className="text-2xl font-semibold">Cadence</h3>
				<p>How many weeks will you spend on each sprint?</p>
			</div>

			<div className="flex flex-col gap-2">
				<Button>One Week</Button>
				<Button>Two Weeks</Button>
				<Button>Three Weeks</Button>
			</div>
		</div>
	)
}

export default Slide2
