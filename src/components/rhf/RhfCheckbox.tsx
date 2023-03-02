/* Specifically for use with react-hook-form. Use Antd's plain <Checkbox /> otherwise. */

import {Checkbox} from "antd"
import {useController} from "react-hook-form"

import type {CheckboxProps as AntdCheckboxProps} from "antd"
import type {ReactElement} from "react"
import type {UseControllerProps} from "react-hook-form"
import type {Promisable, SetRequired, SetReturnType} from "type-fest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FieldValues = Record<string, any>
type OnChange = Exclude<AntdCheckboxProps[`onChange`], undefined>
export type RhfCheckboxProps<TFieldValues extends FieldValues> = Omit<
	AntdCheckboxProps,
	`ref` | `defaultValue` | `onChange`
> &
	SetRequired<UseControllerProps<TFieldValues>, `control`> & {
		onChange?: SetReturnType<OnChange, Promisable<ReturnType<OnChange>>> | undefined
	}

const RhfCheckbox = <TFieldValues extends FieldValues = FieldValues>({
	control,
	name,
	rules,
	shouldUnregister,
	defaultValue,
	onChange,
	...props
}: RhfCheckboxProps<TFieldValues>): ReactElement | null => {
	const {field} = useController({control, name, rules, shouldUnregister, defaultValue})

	return (
		<Checkbox
			{...props}
			onChange={(e) => {
				field.onChange(e.target.checked)
				onChange && Promise.resolve(onChange(e)).catch(console.error)
			}}
			checked={field.value}
			name={field.name}
			ref={(v) => field.ref(v)}
		/>
	)
}

export default RhfCheckbox
