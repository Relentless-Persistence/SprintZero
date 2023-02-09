/* Specifically for use with react-hook-form. Use Antd's plain <Segmented /> otherwise. */

import {Segmented} from "antd"
import {useController} from "react-hook-form"

import type {SegmentedProps as AntdSegmentedProps} from "antd"
import type {ReactElement} from "react"
import type {UseControllerProps} from "react-hook-form"
import type {SetRequired} from "type-fest"

type FieldValues = Record<string, any>
export type RhfSegmentedProps<TFieldValues extends FieldValues> = Omit<AntdSegmentedProps, `ref`> &
	SetRequired<UseControllerProps<TFieldValues>, `control`>

const RhfSegmented = <TFieldValues extends FieldValues = FieldValues>({
	control,
	name,
	rules,
	shouldUnregister,
	defaultValue,
	...props
}: RhfSegmentedProps<TFieldValues>): ReactElement | null => {
	const {field} = useController({control, name, rules, shouldUnregister, defaultValue})

	return (
		<Segmented
			{...props}
			onChange={(value) => field.onChange(value)}
			onBlur={field.onBlur}
			value={field.value}
			name={field.name}
			ref={(v) => field.ref(v)}
		/>
	)
}

export default RhfSegmented
