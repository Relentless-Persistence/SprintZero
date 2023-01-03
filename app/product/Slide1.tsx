import {Form, Input} from "antd5"

import type {FormInputs} from "./types"
import type {FC} from "react"
import type {UseFormReturn} from "react-hook-form"

export type Slide1Props = {
	form: UseFormReturn<FormInputs>
}

const Slide1: FC<Slide1Props> = ({form: {register}}) => {
	return (
		<div className="flex flex-col items-center gap-4">
			<div className="flex flex-col items-center">
				<h3 className="text-2xl font-semibold">Details</h3>
				<p>Please provide information below</p>
			</div>

			<Form layout="vertical">
				<p className="text-lg font-semibold">Product</p>
				<Form.Item extra="32-character limit">
					<Input htmlSize={32} maxLength={32} {...register(`name`)} />
				</Form.Item>

				<p className="text-lg font-semibold">Team</p>
				<Form.Item label="Slot one">
					<Input placeholder="Email address" {...register(`email1`)} />
				</Form.Item>
				<Form.Item label="Slot two">
					<Input placeholder="Email address" {...register(`email2`)} />
				</Form.Item>
				<Form.Item label="Slot three">
					<Input placeholder="Email address" {...register(`email3`)} />
				</Form.Item>
			</Form>
		</div>
	)
}

export default Slide1
