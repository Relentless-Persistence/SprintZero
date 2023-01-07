"use client"

import {doc, onSnapshot} from "firebase9/firestore"
import {useAtomValue} from "jotai"
import {useEffect, useRef} from "react"

import type {FC} from "react"
import type {Id} from "~/types"

import {db} from "~/config/firebase"
import {InputStates, InputStateSchema} from "~/types/db/InputStates"
import {updateInputState} from "~/utils/api/mutations"
import {userIdAtom} from "~/utils/atoms"

export type MultiUserInputProps = {
	value: string
	onChange: (value: string) => void
	inputStateId: Id
	inputProps?: Omit<JSX.IntrinsicElements[`input`], `value` | `onChange` | `onBeforeInput` | `onKeyDown` | `onSelect`>
}

const MultiUserInput: FC<MultiUserInputProps> = ({value, onChange, inputStateId, inputProps}) => {
	const userId = useAtomValue(userIdAtom)
	const ref = useRef<HTMLInputElement | null>(null)

	useEffect(() => {
		const unsubscribe = onSnapshot(doc(db, InputStates._, inputStateId), (doc) => {
			if (!ref.current || !userId) return
			const data = InputStateSchema.parse({id: doc.id, ...doc.data()})
			ref.current.selectionStart = data.selections[userId]?.start ?? null
			ref.current.selectionEnd = data.selections[userId]?.end ?? null
			ref.current.selectionDirection = data.selections[userId]?.direction ?? null
		})
		return unsubscribe
	}, [inputStateId, userId])

	const storeCursorPosition = () => {
		if (userId) {
			updateInputState(inputStateId)({
				inputState: {
					start: ref.current?.selectionStart ?? null,
					end: ref.current?.selectionEnd ?? null,
					direction: ref.current?.selectionDirection ?? null,
				},
				userId,
			})
		}
	}

	return (
		<input
			{...inputProps}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			onBeforeInput={() => void storeCursorPosition()}
			onKeyDown={() => void storeCursorPosition()}
			onSelect={() => void storeCursorPosition()}
		/>
	)
}

export default MultiUserInput
