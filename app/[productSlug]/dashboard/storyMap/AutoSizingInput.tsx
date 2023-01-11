"use client"

import type {FC} from "react"
import type {MultiUserInputProps} from "~/components/MultiUserInput"
import type {Id} from "~/types"

import MultiUserInput from "~/components/MultiUserInput"

export type AutoSizingInputProps = {
	value: string
	inputStateId: Id
	onChange: (value: string) => void
	inputProps?: Omit<MultiUserInputProps[`inputProps`], `className` | `size`>
}

const AutoSizingInput: FC<AutoSizingInputProps> = ({value, onChange, inputStateId, inputProps}) => {
	return (
		<div className="w-max">
			<MultiUserInput
				value={value}
				onChange={onChange}
				inputStateId={inputStateId}
				inputProps={{...inputProps, className: `w-full grow bg-transparent text-center leading-none`, size: 1}}
			/>

			<p className="h-0 overflow-hidden whitespace-pre text-[1em] opacity-0">{value}</p>
		</div>
	)
}

export default AutoSizingInput
