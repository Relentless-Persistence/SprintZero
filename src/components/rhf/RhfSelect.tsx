/* Specifically for use with react-hook-form. Use Antd's plain <Select /> otherwise. */

import {Select} from "antd"
import {AnimatePresence, motion} from "framer-motion"
import {useController} from "react-hook-form"

import type {SelectProps as AntdSelectProps} from "antd"
import type {ReactElement} from "react"
import type {UseControllerProps} from "react-hook-form"
import type {Promisable, SetRequired, SetReturnType} from "type-fest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FieldValues = Record<string, any>
type OnChange = Exclude<AntdSelectProps[`onChange`], undefined>
export type RhfSelectProps<TFieldValues extends FieldValues> = Omit<
	AntdSelectProps,
	`ref` | `defaultValue` | `onChange`
> &
	SetRequired<UseControllerProps<TFieldValues>, `control`> & {
		onChange?: SetReturnType<OnChange, Promisable<ReturnType<OnChange>>> | undefined
	}

const RhfSelect = <TFieldValues extends FieldValues = FieldValues>({
	control,
	name,
	rules,
	shouldUnregister,
	defaultValue,
	onChange,
	...props
}: RhfSelectProps<TFieldValues>): ReactElement | null => {
	const {
		field,
		fieldState: {error},
	} = useController({control, name, rules, defaultValue, shouldUnregister})

	return (
		<div className="grid place-items-stretch">
			<Select
				{...props}
				onChange={(value, option) => {
					field.onChange(value)
					onChange && Promise.resolve(onChange(value, option)).catch(console.error)
				}}
				onBlur={field.onBlur}
				value={field.value}
				ref={(v) => field.ref(v)}
			/>
			<AnimatePresence>
				{error && (
					<motion.p
						initial={{height: `0px`}}
						animate={{height: `auto`}}
						exit={{height: `0px`}}
						className="overflow-hidden leading-tight text-error"
					>
						{error.message}
					</motion.p>
				)}
			</AnimatePresence>
		</div>
	)
}

export default RhfSelect
