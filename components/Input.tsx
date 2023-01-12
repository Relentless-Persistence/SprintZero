import {Input as AntdInput} from "antd5"
import {useController} from "react-hook-form"

import type {InputProps as AntdInputProps} from "antd5"
import type {ReactElement} from "react"
import type {UseControllerProps} from "react-hook-form"

type FieldValues = Record<string, any>

type ControllerProps<TFieldValues extends FieldValues> = UseControllerProps<TFieldValues>

export type InputProps<TFieldValues extends FieldValues> = AntdInputProps &
	ControllerProps<TFieldValues> & {control: Exclude<ControllerProps<TFieldValues>["control"], undefined>} & {
		currencyFormat?: boolean
	}

const formatAsCurrency = (str: string) => {
	let newStr = str.replace(/[^0-9.]/g, ``)
	if (newStr.includes(`.`)) {
		const [dollars, cents] = newStr.split(`.`)
		newStr = `${dollars}.${cents?.slice(0, 2)}`
	}
	return `$${newStr}`
}

const Input = <TFieldValues extends FieldValues = FieldValues>({
	control,
	name,
	currencyFormat,
	...props
}: InputProps<TFieldValues>): ReactElement | null => {
	const {field} = useController({control, name})

	const format = (str: string) => {
		if (str.length === 0) return undefined
		if (currencyFormat) return formatAsCurrency(str)
		return str
	}

	return (
		<AntdInput
			onChange={(e) => void field.onChange(format(e.target.value))}
			onBlur={field.onBlur}
			value={field.value}
			name={field.name}
			ref={(v) => void field.ref(v?.input)}
			{...props}
		/>
	)
}

export default Input
