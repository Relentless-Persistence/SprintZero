export const conditionalThrow = (...errors: Array<unknown>): void => {
	for (const error of errors) {
		if (error) throw error
	}
}
