export type JourneyEvents = {
	id: string

	title: string
	description: string
	start: Date
	end: Date
	isDelighted: string
	level: number
	participants: Array<{
		label: string
		checked: boolean
	}>

	journey_id: string
}
