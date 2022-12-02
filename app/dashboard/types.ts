import type {Id} from "~/types"
import type {Epic} from "~/types/db/Epics"
import type {Feature} from "~/types/db/Features"
import type {Story} from "~/types/db/Stories"

export type FeatureDivider = {
	pos: number
	border: boolean
}

export type StoryDivider = {
	featureId: Id
	featureLeft: number
	featureRight: number
	dividers: number[]
}

export type StoryMapStore = {
	currentVersion: Id | `__ALL_VERSIONS__`
	setCurrentVersion: (version: Id | `__ALL_VERSIONS__`) => void
	newVersionInput: string | null
	setNewVersionInput: (version: string | null) => void

	epics: Epic[]
	setEpics: (epics: Epic[]) => void
	features: Feature[]
	setFeatures: (feature: Feature[]) => void
	stories: Story[]
	setStories: (story: Story[]) => void

	elements: Record<Id, HTMLElement | null>
	registerElement: (id: Id, element: HTMLElement) => void
	pendingDomChanges: Array<{type: `create` | `update` | `delete`; id: Id}>
	reportPendingDomChange: (update: {type: `create` | `update` | `delete`; id: Id}) => void
	dividers: [number[] | null, FeatureDivider[] | null, Array<StoryDivider> | null]
	calculateDividers: (reason?: Id) => void
}
