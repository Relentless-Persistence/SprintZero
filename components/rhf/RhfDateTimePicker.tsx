/* Specifically for use with react-hook-form. Use Antd's plain <DatePicker /> otherwise. */

import {DatePicker} from "antd"
import {Path, useController} from "react-hook-form"

import type {DatePickerProps as AntdDatePickerProps} from "antd"
import type {ReactElement} from "react"
import type {UseControllerProps} from "react-hook-form"
import type {SetRequired} from "type-fest"
import { Dayjs } from "dayjs"

type FieldValues = Record<string, any>
export type RhfDateTimePickerProps<TFieldValues extends FieldValues, Name extends Path<TFieldValues>> = SetRequired<
	UseControllerProps<TFieldValues, Name>,
	`control`
>

const RhfDateTimePicker = <Name extends string, TFieldValues extends {[key: Name]: Dayjs}>({
	control,
	name,
	rules,
	shouldUnregister,
	defaultValue,
	...props
}: RhfDateTimePickerProps<TFieldValues, Name>): ReactElement | null => {
	const {field} = useController({control, name, rules, shouldUnregister, defaultValue})

	return (
		<div>
			<DatePicker
				{...props}
				picker="date"
				onChange={(date) => void field.onChange(field.value date)}
				value={field.value}
				name={field.name}
				ref={(v) => void field.ref(v)}
			/>

			<DatePicker
				{...props}
				picker="time"
				onChange={(e) => void field.onChange(e.target.checked)}
				checked={field.value}
				name={field.name}
				ref={(v) => void field.ref(v)}
			/>
		</div>
	)
}

export default RhfDateTimePicker
