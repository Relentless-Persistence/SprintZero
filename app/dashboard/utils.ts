export const avg = (...arr: number[]): number => arr.reduce((a, b) => a + b, 0) / arr.length

export type Divider = {
	pos: number
	border: boolean
}

export const findDividers = (positionList: number[]): Divider[] => {
	return positionList.reduce(
		(acc, cur) => [...acc, {pos: avg(acc.at(-1)!.pos, cur), border: false}, {pos: cur, border: false}],
		[{pos: positionList[0]!, border: false}],
	)
}
