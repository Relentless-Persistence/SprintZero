import {Input} from "antd5"

import type {ReactElement} from "react"

type Props = {
	value: string
	onChange?: (value: string) => void
}

const StoryMapInput = ({value, onChange}: Props): ReactElement | null => {
	return (
		<div>
			<Input value={value} onChange={(e) => void onChange?.(e.target.value)} />
		</div>
	)
}

export default StoryMapInput
