/* Specifically for use with react-hook-form. Use Antd's plain <TextArea /> otherwise. */

import {Input} from "antd"
import {useController} from "react-hook-form"

import type {TextAreaProps as AntdTextAreaProps} from "antd/es/input"
import type {ReactElement} from "react"
import type {UseControllerProps} from "react-hook-form"
import type {SetRequired} from "type-fest"

type FieldValues = Record<string, any>
export type RhfTextAreaProps<TFieldValues extends FieldValues = FieldValues> = Omit<AntdTextAreaProps, `ref`> &
	SetRequired<UseControllerProps<TFieldValues>, `control`>

const RhfTextArea = <TFieldValues extends FieldValues = FieldValues>({
	control,
	name,
	rules,
	shouldUnregister,
	defaultValue,
	...props
}: RhfTextAreaProps<TFieldValues>): ReactElement | null => {
	const {field} = useController({control, name, rules, shouldUnregister, defaultValue})

	return (
		<Input.TextArea
			{...props}
			onChange={(e) => field.onChange(e.target.value)}
			onBlur={field.onBlur}
			value={field.value}
			name={field.name}
			ref={(v) => field.ref(v?.resizableTextArea)}
		/>
	)
}

export default RhfTextArea
