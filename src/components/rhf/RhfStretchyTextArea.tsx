/* Specifically for use with react-hook-form. Use Antd's plain <TextArea /> otherwise. */

import {useController} from "react-hook-form"

import type {StretchyTextAreaProps} from "../StretchyTextArea"
import type {ReactElement} from "react"
import type {UseControllerProps} from "react-hook-form"
import type {SetRequired} from "type-fest"

import StretchyTextArea from "../StretchyTextArea"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FieldValues = Record<string, any>
export type RhfStretchyTextAreaProps<TFieldValues extends FieldValues = FieldValues> = Omit<
	StretchyTextAreaProps,
	`ref` | `value` | `onChange` | `name` | `onBlur`
> &
	SetRequired<UseControllerProps<TFieldValues>, `control`>

const RhfStretchyTextArea = <TFieldValues extends FieldValues = FieldValues>({
	control,
	name,
	rules,
	shouldUnregister,
	defaultValue,
	...props
}: RhfStretchyTextAreaProps<TFieldValues>): ReactElement | null => {
	const {field} = useController({control, name, rules, shouldUnregister, defaultValue})

	return (
		<StretchyTextArea
			{...props}
			onChange={(e) => field.onChange(e.target.value)}
			onBlur={field.onBlur}
			value={field.value}
			name={field.name}
			ref={field.ref}
		/>
	)
}

export default RhfStretchyTextArea
