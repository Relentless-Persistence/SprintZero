import {Button, Form, Input} from "antd5"
import {useForm} from "react-hook-form"

import type {FC} from "react"

const Slide3: FC = () => {
	const {register} = useForm()

	return (
		<div className="flex flex-col items-center gap-4">
			<div className="flex flex-col items-center">
				<h3 className="text-2xl font-semibold">Gate</h3>
				<p>Which day would you like to begin your sprints?</p>
			</div>

			<Form layout="vertical">
				<Form.Item>
					<div className="flex flex-col gap-2">
						<Button>Monday</Button>
						<Button>Tuesday</Button>
						<Button>Wednesday</Button>
						<Button>Thursday</Button>
						<Button>Friday</Button>
						<Button>Saturday</Button>
						<Button>Sunday</Button>
					</div>
				</Form.Item>
			</Form>
		</div>
	)
}

export default Slide3
