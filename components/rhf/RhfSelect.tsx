/* Specifically for use with react-hook-form. Use Antd's plain <Select /> otherwise. */

import {Select} from "antd"
import {useController} from "react-hook-form"

import type {SelectProps as AntdSelectProps} from "antd"
import type {ReactElement} from "react"
import type {UseControllerProps} from "react-hook-form"
import type {SetRequired} from "type-fest"

type FieldValues = Record<string, any>

type ControllerProps<TFieldValues extends FieldValues> = UseControllerProps<TFieldValues>

export type RhfSelectProps<TFieldValues extends FieldValues> = Omit<AntdSelectProps, `ref`> &
	SetRequired<ControllerProps<TFieldValues>, `control`>

const RhfSelect = <TFieldValues extends FieldValues = FieldValues>({
	control,
	name,
	rules,
	shouldUnregister,
	defaultValue,
	...props
}: RhfSelectProps<TFieldValues>): ReactElement | null => {
	const {field} = useController({control, name, rules, defaultValue, shouldUnregister})

	return (
		<Select
			{...props}
			onChange={(value) => void field.onChange(value)}
			onBlur={field.onBlur}
			value={field.value}
			ref={(v) => void field.ref(v)}
		/>
	)
}

export default RhfSelect
