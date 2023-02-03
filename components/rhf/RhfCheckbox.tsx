/* Specifically for use with react-hook-form. Use Antd's plain <Checkbox /> otherwise. */

import {Checkbox} from "antd"
import {useController} from "react-hook-form"

import type {CheckboxProps as AntdCheckboxProps} from "antd"
import type {ReactElement} from "react"
import type {UseControllerProps} from "react-hook-form"
import type {SetRequired} from "type-fest"

type FieldValues = Record<string, any>
type ControllerProps<TFieldValues extends FieldValues> = UseControllerProps<TFieldValues>
export type RhfCheckboxProps<TFieldValues extends FieldValues> = Omit<AntdCheckboxProps, `ref`> &
	SetRequired<ControllerProps<TFieldValues>, `control`>

const RhfCheckbox = <TFieldValues extends FieldValues = FieldValues>({
	control,
	name,
	rules,
	shouldUnregister,
	defaultValue,
	...props
}: RhfCheckboxProps<TFieldValues>): ReactElement | null => {
	const {field} = useController({control, name, rules, shouldUnregister, defaultValue})

	return (
		<Checkbox
			{...props}
			onChange={(e) => void field.onChange(e.target.checked)}
			checked={field.value}
			name={field.name}
			ref={(v) => void field.ref(v)}
		/>
	)
}

export default RhfCheckbox
