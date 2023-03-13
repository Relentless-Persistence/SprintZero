/* Specifically for use with react-hook-form. Use Antd's plain <DatePicker /> otherwise. */

import {DatePicker} from "antd"
import dayjs from "dayjs"
import {useController} from "react-hook-form"

import type {DatePickerProps} from "antd"
import type {ReactElement} from "react"
import type {UseControllerProps} from "react-hook-form"
import type {Promisable, SetRequired, SetReturnType} from "type-fest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FieldValues = Record<string, any>
type OnChange = Exclude<DatePickerProps[`onChange`], undefined>
export type RhfDateTimePickerProps<TFieldValues extends FieldValues> = SetRequired<
	UseControllerProps<TFieldValues>,
	`control`
> & {
	onChange?: SetReturnType<OnChange, Promisable<ReturnType<OnChange>>> | undefined
}

const RhfDateTimePicker = <TFieldValues extends FieldValues>({
	control,
	name,
	rules,
	shouldUnregister,
	defaultValue,
	onChange,
}: RhfDateTimePickerProps<TFieldValues>): ReactElement | null => {
	const {field} = useController({control, name, rules, shouldUnregister, defaultValue})

	return (
		<div className="flex gap-2">
			<DatePicker
				picker="date"
				onChange={(date, dateString) => {
					if (!date) return
					field.onChange(
						(field.value ?? dayjs()).set(`year`, date.year()).set(`month`, date.month()).set(`date`, date.date()),
					)
					onChange && Promise.resolve(onChange(date, dateString)).catch(console.error)
				}}
				value={field.value}
				name={field.name}
				ref={(v) => field.ref(v)}
			/>

			<DatePicker
				picker="time"
				onChange={(date, dateString) => {
					if (!date) return
					field.onChange(
						(field.value ?? dayjs()).set(`hour`, date.hour()).set(`minute`, date.minute()).set(`second`, date.second()),
					)
					onChange && Promise.resolve(onChange(date, dateString)).catch(console.error)
				}}
				value={field.value}
				name={field.name}
				ref={(v) => field.ref(v)}
			/>
		</div>
	)
}

export default RhfDateTimePicker
