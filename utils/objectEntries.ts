// A more type-safe version of Object.entries
const objectEntries = <A extends string | number | symbol, B>(obj: Record<A, B>): [A, B][] =>
	Object.entries(obj) as [A, B][]

export default objectEntries
