/* Specifically for use with react-hook-form. Use Antd's plain <TextArea /> otherwise. */

import {useController} from "react-hook-form"

import type {TextAreaProps as AntdTextAreaProps} from "antd/es/input"
import type {ReactElement} from "react"
import type {UseControllerProps} from "react-hook-form"
import type {SetRequired} from "type-fest"

import StretchyTextArea from "../StretchyTextArea"

type FieldValues = Record<string, any>
export type RhfStretchyTextAreaProps<TFieldValues extends FieldValues = FieldValues> = Omit<AntdTextAreaProps, `ref`> &
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
			onChange={(e) => void field.onChange(e.target.value)}
			onBlur={field.onBlur}
			value={field.value}
			name={field.name}
			ref={field.ref}
		/>
	)
}

export default RhfStretchyTextArea
