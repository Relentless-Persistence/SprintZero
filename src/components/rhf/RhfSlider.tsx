/* Specifically for use with react-hook-form. Use Antd's plain <Slider /> otherwise. */

import {Slider} from "antd"
import {useController} from "react-hook-form"

import type {SliderSingleProps as AntdSliderProps} from "antd"
import type {ReactElement} from "react"
import type {UseControllerProps} from "react-hook-form"
import type {Promisable, SetRequired, SetReturnType} from "type-fest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FieldValues = Record<string, any>
type OnChange = Exclude<AntdSliderProps[`onChange`], undefined>
export type RhfSliderProps<TFieldValues extends FieldValues> = Omit<
	AntdSliderProps,
	`ref` | `defaultValue` | `onChange`
> &
	SetRequired<UseControllerProps<TFieldValues>, `control`> & {
		onChange?: SetReturnType<OnChange, Promisable<ReturnType<OnChange>>> | undefined
	}

const RhfSlider = <TFieldValues extends FieldValues = FieldValues>({
	control,
	name,
	rules,
	shouldUnregister,
	defaultValue,
	onChange,
	...props
}: RhfSliderProps<TFieldValues>): ReactElement | null => {
	const {field} = useController({control, name, rules, shouldUnregister, defaultValue})

	return (
		<Slider
			{...props}
			onChange={(value) => {
				field.onChange(value)
				onChange && Promise.resolve(onChange(value)).catch(console.error)
			}}
			value={field.value}
			ref={(v) => field.ref(v)}
		/>
	)
}

export default RhfSlider
