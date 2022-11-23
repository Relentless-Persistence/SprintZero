export type Teams = {
	id: string

	expiry: Date
	type: `member`
	user: {
		uid: string
		name: string
		email: string
		avatar: string
	}

	product_id: string
}
