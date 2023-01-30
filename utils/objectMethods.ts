// More type-safe versions of Object.{method}

export const objectEntries = <A extends string | number | symbol, B>(obj: Record<A, B>): [A, B][] =>
	Object.entries(obj) as [A, B][]

export const objectKeys = <A extends string | number | symbol>(obj: Record<A, unknown>): A[] => Object.keys(obj) as A[]
