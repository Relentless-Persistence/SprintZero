import type {InputStatus} from "antd/es/_util/statusUtils"
import type {FieldError} from "react-hook-form"

export const formValidateStatus = ({
	invalid,
	isDirty,
	error,
}: {
	invalid: boolean
	isDirty: boolean
	error?: FieldError
}): InputStatus | undefined => {
	if (invalid || error) return `error`
	if (!isDirty) return undefined
	return ``
}
