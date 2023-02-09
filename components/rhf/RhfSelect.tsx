/* Specifically for use with react-hook-form. Use Antd's plain <Select /> otherwise. */

import {Select} from "antd"
import {useController} from "react-hook-form"

import type {SelectProps as AntdSelectProps} from "antd"
import type {ReactElement} from "react"
import type {UseControllerProps} from "react-hook-form"
import type {SetRequired} from "type-fest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FieldValues = Record<string, any>
export type RhfSelectProps<TFieldValues extends FieldValues> = Omit<AntdSelectProps, `ref`> &
	SetRequired<UseControllerProps<TFieldValues>, `control`>

const RhfSelect = <TFieldValues extends FieldValues = FieldValues>({
	control,
	name,
	rules,
	shouldUnregister,
	defaultValue,
	...props
}: RhfSelectProps<TFieldValues>): ReactElement | null => {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const {field} = useController({control, name, rules, defaultValue, shouldUnregister})

	return (
		<Select
			{...props}
			onChange={(value) => field.onChange(value)}
			onBlur={field.onBlur}
			value={field.value}
			ref={(v) => field.ref(v)}
		/>
	)
}

export default RhfSelect
