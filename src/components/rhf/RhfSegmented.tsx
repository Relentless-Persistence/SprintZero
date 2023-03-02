/* Specifically for use with react-hook-form. Use Antd's plain <Segmented /> otherwise. */

import {Segmented} from "antd"
import {useController} from "react-hook-form"

import type {SegmentedProps as AntdSegmentedProps} from "antd"
import type {ReactElement} from "react"
import type {UseControllerProps} from "react-hook-form"
import type {Promisable, SetRequired, SetReturnType} from "type-fest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FieldValues = Record<string, any>
type OnChange = Exclude<AntdSegmentedProps[`onChange`], undefined>
export type RhfSegmentedProps<TFieldValues extends FieldValues> = Omit<
	AntdSegmentedProps,
	`ref` | `defaultValue` | `onChange`
> &
	SetRequired<UseControllerProps<TFieldValues>, `control`> & {
		onChange?: SetReturnType<OnChange, Promisable<ReturnType<OnChange>>> | undefined
	}

const RhfSegmented = <TFieldValues extends FieldValues = FieldValues>({
	control,
	name,
	rules,
	shouldUnregister,
	defaultValue,
	onChange,
	...props
}: RhfSegmentedProps<TFieldValues>): ReactElement | null => {
	const {field} = useController({control, name, rules, shouldUnregister, defaultValue})

	return (
		<Segmented
			{...props}
			onChange={(value) => {
				field.onChange(value)
				onChange && Promise.resolve(onChange(value)).catch(console.error)
			}}
			onBlur={field.onBlur}
			value={field.value}
			name={field.name}
			ref={(v) => field.ref(v)}
		/>
	)
}

export default RhfSegmented
