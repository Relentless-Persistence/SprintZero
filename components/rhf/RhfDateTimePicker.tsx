/* Specifically for use with react-hook-form. Use Antd's plain <DatePicker /> otherwise. */

import {DatePicker} from "antd"
import dayjs from "dayjs"
import {useController} from "react-hook-form"

import type {Dayjs} from "dayjs"
import type {ReactElement} from "react"
import type {UseControllerProps} from "react-hook-form"
import type {SetRequired} from "type-fest"

type FieldValues = Record<string, any>
export type RhfDateTimePickerProps<TFieldValues extends FieldValues> = SetRequired<
	UseControllerProps<TFieldValues>,
	`control`
>

const RhfDateTimePicker = <TFieldValues extends FieldValues>({
	control,
	name,
	rules,
	shouldUnregister,
	defaultValue,
}: RhfDateTimePickerProps<TFieldValues>): ReactElement | null => {
	const {field} = useController({control, name, rules, shouldUnregister, defaultValue})

	return (
		<div className="flex gap-2">
			<DatePicker
				picker="date"
				onChange={(date) => {
					if (!date) return
					field.onChange(
						((field.value ?? dayjs()) as Dayjs)
							.set(`year`, date.year())
							.set(`month`, date.month())
							.set(`date`, date.date()),
					)
				}}
				value={field.value}
				name={field.name}
				ref={(v) => field.ref(v)}
			/>

			<DatePicker
				picker="time"
				onChange={(date) => {
					if (!date) return
					field.onChange(
						((field.value ?? dayjs()) as Dayjs)
							.set(`hour`, date.hour())
							.set(`minute`, date.minute())
							.set(`second`, date.second()),
					)
				}}
				value={field.value}
				name={field.name}
				ref={(v) => field.ref(v)}
			/>
		</div>
	)
}

export default RhfDateTimePicker
