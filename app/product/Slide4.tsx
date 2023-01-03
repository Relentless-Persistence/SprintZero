import {Button, Form, Input} from "antd5"
import {useForm} from "react-hook-form"

import type {FC} from "react"

const Slide4: FC = () => {
	const {register} = useForm()

	return (
		<div className="flex flex-col items-center gap-4">
			<div className="flex flex-col items-center">
				<h3 className="text-2xl font-semibold">Effort Cost</h3>
				<p>How much is 1 story point?</p>
			</div>

			<Form layout="vertical">
				<Form.Item extra="Optional">
					<Input placeholder="$0.00" htmlSize={20} />
				</Form.Item>
			</Form>
		</div>
	)
}

export default Slide4
