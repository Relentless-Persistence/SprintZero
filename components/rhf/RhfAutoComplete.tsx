/* Specifically for use with react-hook-form. Use Antd's plain <AutoComplete /> otherwise. */

import {AutoComplete} from "antd"
import {useController} from "react-hook-form"

import type {AutoCompleteProps as AntdAutoCompleteProps} from "antd"
import type {ReactElement} from "react"
import type {UseControllerProps} from "react-hook-form"
import type {SetRequired} from "type-fest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FieldValues = Record<string, any>
export type RhfAutoCompleteProps<TFieldValues extends FieldValues> = Omit<
	AntdAutoCompleteProps,
	`ref` | `defaultValue`
> &
	SetRequired<UseControllerProps<TFieldValues>, `control`>

const RhfAutoComplete = <TFieldValues extends FieldValues = FieldValues>({
	control,
	name,
	rules,
	shouldUnregister,
	defaultValue,
	onChange,
	...props
}: RhfAutoCompleteProps<TFieldValues>): ReactElement | null => {
	const {field} = useController({control, name, rules, shouldUnregister, defaultValue})

	return (
		<AutoComplete
			{...props}
			onChange={(value, option) => {
				field.onChange(value)
				onChange?.(value, option)
			}}
			value={field.value}
			ref={(v) => field.ref(v)}
		/>
	)
}

export default RhfAutoComplete
