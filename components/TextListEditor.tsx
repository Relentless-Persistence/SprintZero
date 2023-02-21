import {MinusCircleOutlined, PlusCircleOutlined} from "@ant-design/icons"
import {Button, Input} from "antd"
import produce from "immer"
import {nanoid} from "nanoid"
import {forwardRef, useEffect, useRef} from "react"

import type {Dispatch, ForwardRefRenderFunction, SetStateAction} from "react"

export type TextListEditorProps = {
	textList: Array<{id: string; text: string}>
	onChange: Dispatch<SetStateAction<Array<{id: string; text: string}>>>
	onBlur?: () => void
}

const TextListEditor: ForwardRefRenderFunction<HTMLInputElement, TextListEditorProps> = (
	{textList, onChange, onBlur},
	ref,
) => {
	useEffect(() => {
		if (textList.length === 0) onChange([{id: nanoid(), text: ``}])
	}, [onChange, textList.length])

	// For managing focus on new elements
	const newestElement = useRef<string>(``)

	return (
		<div className="flex flex-col gap-2">
			{textList.map((item, i) => (
				<Input.Group key={item.id} compact className="!flex w-full">
					<Button
						onClick={() =>
							onChange((state) => {
								let newState = [...state]
								newState.splice(i, 1)
								if (newState.length === 0) newState = [{id: nanoid(), text: ``}]
								return newState
							})
						}
						className="!inline-flex w-16 shrink-0 grow-0 basis-16 items-center"
					>
						<MinusCircleOutlined className="text-[#c82d73]" />
						{i + 1}.
					</Button>
					<Input
						value={item.text}
						onChange={(e) =>
							onChange((state) =>
								produce(state, (draft) => {
									draft[i]!.text = e.target.value
								}),
							)
						}
						onBlur={() => onBlur?.()}
						onPressEnter={() => {
							if (textList.at(-1)!.text !== ``) {
								const newId = nanoid()
								newestElement.current = newId
								onChange((state) => [...state, {id: newId, text: ``}])
							}
						}}
						autoFocus={newestElement.current === item.id}
						className="grow border-r-0"
						ref={
							i === 0
								? (v) => {
										if (typeof ref === `function`) ref(v?.input ?? null)
										else if (ref) ref.current = v?.input ?? null
								  }
								: undefined
						}
					/>
					{i === textList.length - 1 && (
						<Button
							onClick={() => {
								const newId = nanoid()
								newestElement.current = newId
								onChange((state) => [...state, {id: newId, text: ``}])
							}}
						>
							<PlusCircleOutlined className="align-middle text-[#009c7e]" />
						</Button>
					)}
				</Input.Group>
			))}
		</div>
	)
}

export default forwardRef(TextListEditor)
