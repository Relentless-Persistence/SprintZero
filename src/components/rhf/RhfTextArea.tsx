/* Specifically for use with react-hook-form. Use Antd's plain <TextArea /> otherwise. */

import {Input} from "antd"
import {AnimatePresence, motion} from "framer-motion"
import {useController} from "react-hook-form"

import type {TextAreaProps as AntdTextAreaProps} from "antd/es/input"
import type {ReactElement} from "react"
import type {UseControllerProps} from "react-hook-form"
import type {SetRequired} from "type-fest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FieldValues = Record<string, any>
export type RhfTextAreaProps<TFieldValues extends FieldValues = FieldValues> = Omit<AntdTextAreaProps, `ref`> &
	SetRequired<UseControllerProps<TFieldValues>, `control`>

const RhfTextArea = <TFieldValues extends FieldValues = FieldValues>({
	control,
	name,
	rules,
	shouldUnregister,
	defaultValue,
	...props
}: RhfTextAreaProps<TFieldValues>): ReactElement | null => {
	const {
		field,
		fieldState: {error},
	} = useController({control, name, rules, shouldUnregister, defaultValue})

	return (
		<div>
			<Input.TextArea
				{...props}
				onChange={(e) => {
					field.onChange(e.target.value)
					props.onChange?.(e)
				}}
				onBlur={field.onBlur}
				value={field.value}
				name={field.name}
				status={error ? `error` : undefined}
				ref={(v) => field.ref(v?.resizableTextArea)}
			/>
			<AnimatePresence>
				{error && (
					<motion.p
						initial={{height: `0px`}}
						animate={{height: `auto`}}
						exit={{height: `0px`}}
						className="overflow-hidden text-error"
					>
						{error.message}
					</motion.p>
				)}
			</AnimatePresence>
		</div>
	)
}

export default RhfTextArea
