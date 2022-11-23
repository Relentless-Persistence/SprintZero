export type InviteToken = {
	id: string

	token: string
	type: `viewer` | `member`

	product_id: string
}
