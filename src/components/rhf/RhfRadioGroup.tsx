/* Specifically for use with react-hook-form. Use Antd's plain <Radio.Group /> otherwise. */

import {Radio} from "antd"
import {useController} from "react-hook-form"

import type {RadioGroupProps as AntdRadioGroupProps} from "antd"
import type {ReactElement} from "react"
import type {UseControllerProps} from "react-hook-form"
import type {SetRequired} from "type-fest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FieldValues = Record<string, any>
export type RhfRadioGroupProps<TFieldValues extends FieldValues> = Omit<AntdRadioGroupProps, `ref` | `defaultValue`> &
	SetRequired<UseControllerProps<TFieldValues>, `control`>

const RhfRadioGroup = <TFieldValues extends FieldValues = FieldValues>({
	control,
	name,
	rules,
	shouldUnregister,
	defaultValue,
	...props
}: RhfRadioGroupProps<TFieldValues>): ReactElement | null => {
	const {field} = useController({control, name, rules, shouldUnregister, defaultValue})

	return (
		<Radio.Group
			{...props}
			onChange={(e) => field.onChange(e.target.value)}
			value={field.value}
			name={field.name}
			ref={(v) => field.ref(v)}
		/>
	)
}

export default RhfRadioGroup
