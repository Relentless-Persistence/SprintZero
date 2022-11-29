const avg = (...arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length

type Divider = {
	pos: number
	border: boolean
}

export const findDividers = (items: HTMLElement[]): Divider[] =>
	items.reduce(
		(acc, item) => {
			const itemPos = item.offsetLeft
			return [...acc, {pos: avg(acc.at(-1)!.pos, itemPos), border: false}, {pos: itemPos, border: false}]
		},
		[{pos: items[0]!.offsetLeft, border: false}],
	)
