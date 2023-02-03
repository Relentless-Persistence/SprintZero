/* Specifically for use with react-hook-form. Use Antd's plain <Input /> otherwise. */

import {Input} from "antd"
import {useController} from "react-hook-form"

import type {InputProps as AntdInputProps} from "antd"
import type {ReactElement} from "react"
import type {UseControllerProps} from "react-hook-form"
import type {SetRequired} from "type-fest"

const formatAsCurrency = (str: string) => {
	let newStr = str.replace(/[^0-9.]/g, ``)
	if (newStr.includes(`.`)) {
		const [dollars, cents] = newStr.split(`.`)
		newStr = `${dollars}.${cents?.slice(0, 2)}`
	}
	return `$${newStr}`
}

type FieldValues = Record<string, any>
type ControllerProps<TFieldValues extends FieldValues> = UseControllerProps<TFieldValues>
export type RhfInputProps<TFieldValues extends FieldValues> = Omit<AntdInputProps, `ref`> &
	SetRequired<ControllerProps<TFieldValues>, `control`> & {
		currencyFormat?: boolean
	}

const RhfInput = <TFieldValues extends FieldValues = FieldValues>({
	control,
	name,
	rules,
	shouldUnregister,
	defaultValue,
	currencyFormat,
	...props
}: RhfInputProps<TFieldValues>): ReactElement | null => {
	const {field} = useController({control, name, rules, shouldUnregister, defaultValue})

	const format = (str: string) => {
		if (str.length === 0) return null
		if (currencyFormat) return formatAsCurrency(str)
		return str
	}

	return (
		<Input
			{...props}
			onChange={(e) => void field.onChange(format(e.target.value))}
			onBlur={field.onBlur}
			value={field.value}
			name={field.name}
			ref={(v) => void field.ref(v?.input)}
		/>
	)
}

export default RhfInput
