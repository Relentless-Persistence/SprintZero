/* Specifically for use with react-hook-form. Use Antd's plain <TextArea /> otherwise. */

import {Input} from "antd"
import {AnimatePresence, motion} from "framer-motion"
import {useController} from "react-hook-form"

import type {TextAreaProps as AntdTextAreaProps} from "antd/es/input"
import type {ReactElement} from "react"
import type {UseControllerProps} from "react-hook-form"
import type {Promisable, SetRequired, SetReturnType} from "type-fest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FieldValues = Record<string, any>
type OnChange = Exclude<AntdTextAreaProps[`onChange`], undefined>
export type RhfTextAreaProps<TFieldValues extends FieldValues = FieldValues> = Omit<
	AntdTextAreaProps,
	`ref` | `defaultValue` | `onChange`
> &
	SetRequired<UseControllerProps<TFieldValues>, `control`> & {
		wrapperClassName?: string
		onChange?: SetReturnType<OnChange, Promisable<ReturnType<OnChange>>> | undefined
	}

const RhfTextArea = <TFieldValues extends FieldValues = FieldValues>({
	control,
	name,
	rules,
	shouldUnregister,
	defaultValue,
	wrapperClassName,
	onChange,
	...props
}: RhfTextAreaProps<TFieldValues>): ReactElement | null => {
	const {
		field,
		fieldState: {error},
	} = useController({control, name, rules, shouldUnregister, defaultValue})

	return (
		<div className={wrapperClassName}>
			<Input.TextArea
				{...props}
				onChange={(e) => {
					field.onChange(e.target.value || null)
					onChange && Promise.resolve(onChange(e)).catch(console.error)
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
