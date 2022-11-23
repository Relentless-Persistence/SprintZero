export type StoriesComments = {
	id: string

	author: {
		name: string
		avatar: string
	}
	comment: string
	type: `code` | `design`

	story_id: string
	createdAt: Date
}
