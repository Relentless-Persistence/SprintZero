/* Specifically for use with react-hook-form. Use Antd's plain <Radio.Group /> otherwise. */

import {Radio} from "antd"
import {AnimatePresence, motion} from "framer-motion"
import {useController} from "react-hook-form"

import type {RadioGroupProps as AntdRadioGroupProps} from "antd"
import type {ReactElement} from "react"
import type {UseControllerProps} from "react-hook-form"
import type {Promisable, SetRequired, SetReturnType} from "type-fest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FieldValues = Record<string, any>
type OnChange = Exclude<AntdRadioGroupProps[`onChange`], undefined>
export type RhfRadioGroupProps<TFieldValues extends FieldValues> = Omit<
	AntdRadioGroupProps,
	`ref` | `defaultValue` | `onChange`
> &
	SetRequired<UseControllerProps<TFieldValues>, `control`> & {
		onChange?: SetReturnType<OnChange, Promisable<ReturnType<OnChange>>> | undefined
	}

const RhfRadioGroup = <TFieldValues extends FieldValues = FieldValues>({
	control,
	name,
	rules,
	shouldUnregister,
	defaultValue,
	onChange,
	...props
}: RhfRadioGroupProps<TFieldValues>): ReactElement | null => {
	const {
		field,
		fieldState: {error},
	} = useController({control, name, rules, shouldUnregister, defaultValue})

	return (
		<div>
			<Radio.Group
				{...props}
				onChange={(e) => {
					field.onChange(e.target.value)
					onChange && Promise.resolve(onChange(e)).catch(console.error)
				}}
				value={field.value}
				name={field.name}
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

export default RhfRadioGroup
