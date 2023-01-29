import {MinusCircleOutlined, PlusCircleOutlined} from "@ant-design/icons"
import {Button, Input} from "antd5"
import produce from "immer"
import {nanoid} from "nanoid"

import type {Dispatch, FC, SetStateAction} from "react"

export type TextListEditorProps = {
	textList: Array<{id: string; text: string}>
	onChange: Dispatch<SetStateAction<Array<{id: string; text: string}>>>
}

const TextListEditor: FC<TextListEditorProps> = ({textList, onChange}) => {
	return (
		<div className="space-y-2">
			{/* All items but last - REMEMBER: IF YOU CHANGE STUFF HERE, DON'T FORGET ABOUT THE LAST ITEM!! */}
			{textList.slice(0, -1).map((item, i) => (
				<Input.Group key={item.id} compact className="!flex w-full">
					<Button
						onClick={() =>
							void onChange((state) => {
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
							void onChange((state) =>
								produce(state, (draft) => {
									draft[i]!.text = e.target.value
								}),
							)
						}
						className="grow border-r-0"
					/>
				</Input.Group>
			))}

			{/* The last item - By chance this also handles the case when textList.length === 0. */}
			<form
				onSubmit={(e) => {
					e.preventDefault()
					onChange((state) => (state.at(-1)!.text === `` ? state : [...state, {id: nanoid(), text: ``}]))
				}}
			>
				<Input.Group compact className="!flex w-full">
					<Button
						onClick={() =>
							void onChange((state) => {
								let newState = [...state]
								newState.splice(textList.length - 1, 1)
								if (newState.length === 0) newState = [{id: nanoid(), text: ``}]
								return newState
							})
						}
						className="!inline-flex w-16 shrink-0 grow-0 basis-16 items-center"
					>
						<MinusCircleOutlined className="text-[#c82d73]" />
						{textList.length || 1}.
					</Button>
					<Input
						value={textList.at(-1)?.text}
						onChange={(e) =>
							void onChange((state) =>
								produce(state, (draft) => {
									if (draft.length === 0) draft.push({id: nanoid(), text: e.target.value})
									else draft[textList.length - 1]!.text = e.target.value
								}),
							)
						}
						className="grow border-r-0"
					/>
					<Button htmlType="submit">
						<PlusCircleOutlined className="align-middle text-green-s500" />
					</Button>
				</Input.Group>
			</form>
		</div>
	)
}

export default TextListEditor
