export type Product = {
	id: string

	cadence: string
	cost: string
	currency: string
	email1: string
	email2: string
	email3: string
	gate: `Monday` | `Tuesday` | `Wednesday` | `Thursday` | `Friday` | `Saturday` | `Sunday`
	owner: string
	product: string

	updatedAt: Date
}
