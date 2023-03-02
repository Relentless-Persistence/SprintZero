/* Specifically for use with react-hook-form. Use Antd's plain <AutoComplete /> otherwise. */

import {AutoComplete} from "antd"
import {useController} from "react-hook-form"

import type {AutoCompleteProps as AntdAutoCompleteProps} from "antd"
import type {ReactElement} from "react"
import type {UseControllerProps} from "react-hook-form"
import type {Promisable, SetRequired, SetReturnType} from "type-fest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FieldValues = Record<string, any>
type OnChange = Exclude<AntdAutoCompleteProps[`onChange`], undefined>
export type RhfAutoCompleteProps<TFieldValues extends FieldValues> = Omit<
	AntdAutoCompleteProps,
	`ref` | `defaultValue` | `onChange`
> &
	SetRequired<UseControllerProps<TFieldValues>, `control`> & {
		onChange?: SetReturnType<OnChange, Promisable<ReturnType<OnChange>>> | undefined
	}

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
				onChange && Promise.resolve(onChange(value, option)).catch(console.error)
			}}
			value={field.value}
			ref={(v) => field.ref(v)}
		/>
	)
}

export default RhfAutoComplete
