/* Specifically for use with react-hook-form. Use Antd's plain <TextArea /> otherwise. */

import {useController} from "react-hook-form"

import type {StretchyTextAreaProps} from "../StretchyTextArea"
import type {ReactElement} from "react"
import type {UseControllerProps} from "react-hook-form"
import type {Promisable, SetRequired, SetReturnType} from "type-fest"

import StretchyTextArea from "../StretchyTextArea"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FieldValues = Record<string, any>
type OnChange = Exclude<StretchyTextAreaProps[`onChange`], undefined>
export type RhfStretchyTextAreaProps<TFieldValues extends FieldValues = FieldValues> = Omit<
	StretchyTextAreaProps,
	`ref` | `value` | `onChange` | `name` | `onBlur`
> &
	SetRequired<UseControllerProps<TFieldValues>, `control`> & {
		onChange?: SetReturnType<OnChange, Promisable<ReturnType<OnChange>>> | undefined
	}

const RhfStretchyTextArea = <TFieldValues extends FieldValues = FieldValues>({
	control,
	name,
	rules,
	shouldUnregister,
	defaultValue,
	onChange,
	...props
}: RhfStretchyTextAreaProps<TFieldValues>): ReactElement | null => {
	const {field} = useController({control, name, rules, shouldUnregister, defaultValue})

	return (
		<StretchyTextArea
			{...props}
			onChange={(e) => {
				field.onChange(e.target.value)
				onChange && Promise.resolve(onChange(e)).catch(console.error)
			}}
			onBlur={field.onBlur}
			value={field.value}
			name={field.name}
			ref={field.ref}
		/>
	)
}

export default RhfStretchyTextArea
