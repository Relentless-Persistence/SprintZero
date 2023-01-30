/* Specifically for use with react-hook-form. Use Antd's plain <Input /> otherwise. */

import {Segmented} from "antd5"
import {useController} from "react-hook-form"

import type {SegmentedProps as AntdSegmentedProps} from "antd5"
import type {ReactElement} from "react"
import type {UseControllerProps} from "react-hook-form"
import type {SetRequired} from "type-fest"

type FieldValues = Record<string, any>

type ControllerProps<TFieldValues extends FieldValues> = UseControllerProps<TFieldValues>

export type RhfSegmentedProps<TFieldValues extends FieldValues> = Omit<AntdSegmentedProps, `ref`> &
	SetRequired<ControllerProps<TFieldValues>, `control`>

const RhfSegmented = <TFieldValues extends FieldValues = FieldValues>({
	control,
	name,
	...props
}: RhfSegmentedProps<TFieldValues>): ReactElement | null => {
	const {field} = useController({control, name})

	return (
		<Segmented
			{...props}
			onChange={(value) => void field.onChange(value)}
			onBlur={field.onBlur}
			value={field.value}
			name={field.name}
			ref={(v) => void field.ref(v)}
		/>
	)
}

export default RhfSegmented
