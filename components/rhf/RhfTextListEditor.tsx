import {useController} from "react-hook-form"

import type {ReactElement} from "react"
import type {UseControllerProps} from "react-hook-form"
import type {SetRequired} from "type-fest"

import TextListEditor from "../TextListEditor"

type FieldValues = Record<string, any>
type ControllerProps<TFieldValues extends FieldValues> = UseControllerProps<TFieldValues>
export type RhfTextListEditorProps<TFieldValues extends FieldValues> = SetRequired<
	ControllerProps<TFieldValues>,
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
