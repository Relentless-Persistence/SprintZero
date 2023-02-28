import type {FieldError} from "react-hook-form"

export const formValidateStatus = ({
	invalid,
	isDirty,
	error,
}: {
	invalid: boolean
	isDirty: boolean
	error?: FieldError
}): "" | "error" | "success" | "warning" | "validating" | undefined => {
	if (invalid || error) return `error`
	if (!isDirty) return undefined
	return `success`
}
