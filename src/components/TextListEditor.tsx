import { DeleteOutlined, MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons"
import { Button, Input } from "antd"
import { AnimatePresence, motion } from "framer-motion"
import produce from "immer"
import { nanoid } from "nanoid"
import { forwardRef, useEffect, useRef } from "react"

import type { Dispatch, ForwardRefRenderFunction, SetStateAction } from "react"
import type { FieldErrors } from "react-hook-form"

export type TextListEditorProps = {
	textList: Array<{ id: string; text: string }>
	onChange: Dispatch<SetStateAction<Array<{ id: string; text: string }>>>
	onBlur?: () => void
	maxItems?: number
	disabled?: boolean
	errors?: FieldErrors<Array<{ text: string }>>,
}

const TextListEditor: ForwardRefRenderFunction<HTMLInputElement, TextListEditorProps> = (
	{ textList, onChange, onBlur, maxItems, disabled = false, errors },
	ref,
) => {
	useEffect(() => {
		if (textList.length === 0) onChange([{ id: nanoid(), text: `` }])
	}, [onChange, textList.length])

	// For managing focus on new elements
	const newestElement = useRef<string>(``)

	return (
		<div className="flex flex-col gap-2">
			{textList.map((item, i) => (
				<div key={item.id} className="flex flex-col">
					<Input
						prefix={`${i + 1}.`}
						suffix={
							<DeleteOutlined
								disabled={disabled}
								//danger={errors?.[i]?.text !== undefined}
								onClick={() =>
									onChange((state) => {
										let newState = [...state]
										newState.splice(i, 1)
										if (newState.length === 0) newState = [{ id: nanoid(), text: `` }]
										return newState
									})
								}
							/>
						}
						value={item.text}
						disabled={disabled}
						status={errors?.[i]?.text ? `error` : undefined}
						onChange={(e) =>
							onChange((state) =>
								produce(state, (draft) => {
									draft[i]!.text = e.target.value
								}),
							)
						}
						onBlur={() => onBlur?.()}
						autoFocus={newestElement.current === item.id}
						className="grow border-r-0"
						ref={
							errors?.[i]?.text
								? (v) => {
									if (typeof ref === `function`) ref(v?.input ?? null)
									else if (ref) ref.current = v?.input ?? null
								}
								: undefined
						}
					/>
					{/* {i === textList.length - 1 && textList.length < (maxItems ?? Infinity) && (
							<Button
								danger={errors?.[i]?.text !== undefined}
								disabled={textList.at(-1)!.text.trim() === `` || disabled}
								onClick={() => {
									const newId = nanoid()
									newestElement.current = newId
									onChange((state) => [...state, { id: newId, text: `` }])
								}}
							>
								<PlusCircleOutlined className="align-middle" />
							</Button>
						)} */}
					<AnimatePresence>
						{errors?.[i]?.text && (
							<motion.p
								initial={{ height: `0px` }}
								animate={{ height: `auto` }}
								exit={{ height: `0px` }}
								className="overflow-hidden text-error"
							>
								{errors[i]?.text?.message}
							</motion.p>
						)}
					</AnimatePresence>
				</div>
			))}
			<Button block className="mt-1"
				onClick={() => {
					if (textList.at(-1)!.text !== ``) {
						const newId = nanoid()
						newestElement.current = newId
						onChange((state) => [...state, { id: newId, text: `` }])
					}
				}}
			>Add</Button>
		</div>
	)
}

export default forwardRef(TextListEditor)
