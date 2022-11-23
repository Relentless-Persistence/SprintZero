export type Retrospectives = {
	id: string

	title: string
	description: string
	type: `Enjoyable` | `Puzzling`
	user: {
		id: string
		name: string
		photo: string
	}

	product_id: string
}
