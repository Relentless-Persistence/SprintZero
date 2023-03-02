/* Specifically for use with react-hook-form. Use Antd's plain <Radio.Group /> otherwise. */

import {Radio} from "antd"
import {useController} from "react-hook-form"

import type {RadioGroupProps as AntdRadioGroupProps} from "antd"
import type {ReactElement} from "react"
import type {UseControllerProps} from "react-hook-form"
import type {Promisable, SetRequired, SetReturnType} from "type-fest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FieldValues = Record<string, any>
type OnChange = Exclude<AntdRadioGroupProps[`onChange`], undefined>
export type RhfRadioGroupProps<TFieldValues extends FieldValues> = Omit<
	AntdRadioGroupProps,
	`ref` | `defaultValue` | `onChange`
> &
	SetRequired<UseControllerProps<TFieldValues>, `control`> & {
		onChange?: SetReturnType<OnChange, Promisable<ReturnType<OnChange>>> | undefined
	}

const RhfRadioGroup = <TFieldValues extends FieldValues = FieldValues>({
	control,
	name,
	rules,
	shouldUnregister,
	defaultValue,
	onChange,
	...props
}: RhfRadioGroupProps<TFieldValues>): ReactElement | null => {
	const {field} = useController({control, name, rules, shouldUnregister, defaultValue})

	return (
		<Radio.Group
			{...props}
			onChange={(e) => {
				field.onChange(e.target.value)
				onChange && Promise.resolve(onChange(e)).catch(console.error)
			}}
			value={field.value}
			name={field.name}
			ref={(v) => field.ref(v)}
		/>
	)
}

export default RhfRadioGroup
