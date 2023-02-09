import {useController} from "react-hook-form"

import type {ReactElement} from "react"
import type {UseControllerProps} from "react-hook-form"
import type {SetRequired} from "type-fest"

import TextListEditor from "../TextListEditor"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FieldValues = Record<string, any>
export type RhfTextListEditorProps<TFieldValues extends FieldValues> = SetRequired<
	UseControllerProps<TFieldValues>,
	`control`
>

const RhfTextListEditor = <TFieldValues extends FieldValues = FieldValues>(
	props: RhfTextListEditorProps<TFieldValues>,
): ReactElement | null => {
	const {field} = useController(props)

	return (
		<TextListEditor
			textList={field.value}
			onChange={(list) => {
				if (typeof list === `function`) field.onChange(list(field.value))
				else field.onChange(list)
			}}
			onBlur={field.onBlur}
			ref={field.ref}
		/>
	)
}

export default RhfTextListEditor
