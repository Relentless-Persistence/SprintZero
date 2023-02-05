/* Specifically for use with react-hook-form. Use Antd's plain <Slider /> otherwise. */

import {Slider} from "antd"
import {useController} from "react-hook-form"

import type {SliderSingleProps as AntdSliderProps} from "antd"
import type {ReactElement} from "react"
import type {UseControllerProps} from "react-hook-form"
import type {SetRequired} from "type-fest"

type FieldValues = Record<string, any>
export type RhfSliderProps<TFieldValues extends FieldValues> = Omit<AntdSliderProps, `ref`> &
	SetRequired<UseControllerProps<TFieldValues>, `control`>

const RhfSlider = <TFieldValues extends FieldValues = FieldValues>({
	control,
	name,
	rules,
	shouldUnregister,
	defaultValue,
	...props
}: RhfSliderProps<TFieldValues>): ReactElement | null => {
	const {field} = useController({control, name, rules, shouldUnregister, defaultValue})

	return (
		<Slider
			{...props}
			onChange={(value) => void field.onChange(value)}
			value={field.value}
			ref={(v) => void field.ref(v)}
		/>
	)
}

export default RhfSlider
