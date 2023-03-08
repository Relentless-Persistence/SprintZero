export const conditionalThrow = (...errors: Array<Error | undefined>): void => {
	for (const error of errors) {
		if (error) throw error
	}
}
