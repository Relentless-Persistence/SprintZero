import {atom} from "jotai"

import type {Id} from "~/types"
import type {Epic} from "~/types/db/Epics"
import type {Feature} from "~/types/db/Features"
import type {Story} from "~/types/db/Stories"

import {avg, epicsByCurrentVersion, featuresByCurrentVersion, storiesByCurrentVersion} from "./utils"

export const currentVersionAtom = atom<Id | `__ALL_VERSIONS__`>(`__ALL_VERSIONS__`)
export const newVersionInputAtom = atom<string | null>(null)

export const epicsAtom = atom<Epic[]>([])
export const featuresAtom = atom<Feature[]>([])
export const storiesAtom = atom<Story[]>([])

export const elementsAtom = atom<Record<Id, HTMLElement | null>>({})
export const registerElementAtom = atom<null, {id: string; element: HTMLElement}>(null, (get, set, update) => {
	set(elementsAtom, (prev) => ({...prev, [update.id]: update.element}))
})

export const pendingDomChangesAtom = atom<Array<{type: `create` | `update` | `delete`; id: Id}>>([])
export const reportPendingDomChangeAtom = atom<null, {type: `create` | `update` | `delete`; id: Id}>(
	null,
	(get, set, update) => {
		set(pendingDomChangesAtom, (prev) => [...prev, update])
	},
)

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

export const dividersAtom = atom<[number[] | null, FeatureDivider[] | null, Array<StoryDivider> | null]>([
	null,
	null,
	null,
])
export const calculateDividersAtom = atom<null, Id | undefined>(null, (get, set, reason) => {
	const epics = get(epicsAtom)
	const features = get(featuresAtom)
	const stories = get(storiesAtom)
	const elements = get(elementsAtom)
	const currentVersion = get(currentVersionAtom)

	if (
		epicsByCurrentVersion(epics, stories, currentVersion).every((epic) => !!elements[epic.id]) &&
		featuresByCurrentVersion(features, stories, currentVersion).every((feature) => !!elements[feature.id]) &&
		storiesByCurrentVersion(stories, currentVersion).every((story) => !!elements[story.id])
	) {
		let epicDividers: number[] = []
		epics.forEach((epic, i) => {
			const element = elements[epic.id]!
			const epicPos = element!.offsetLeft + element!.offsetWidth / 2
			if (i > 0) epicDividers.push(avg(epicDividers.at(-1)!, epicPos))
			epicDividers.push(epicPos)
		})

		let featureDividers: FeatureDivider[] = []
		features.forEach((feature, i) => {
			const element = elements[feature.id]!
			const featurePos = element!.offsetLeft + element!.offsetWidth / 2
			if (i === 0) {
				featureDividers.push({pos: featurePos, border: false})
			} else {
				featureDividers.push({
					pos: avg(featureDividers.at(-1)!.pos, featurePos),
					border: feature.prev_feature === null,
				})
				featureDividers.push({pos: featurePos, border: false})
			}
		})

		let storyDividers: StoryDivider[] = features.map((feature) => {
			const element = elements[feature.id]!
			return {
				featureId: feature.id,
				featureLeft: element!.offsetLeft,
				featureRight: element!.offsetLeft + element!.offsetWidth,
				dividers: (() => {
					const featureStories = stories.filter((story) => story.feature === feature.id)
					const dividers: number[] = []
					featureStories.forEach((story, i) => {
						const element = elements[story.id]!
						const storyPos = element!.offsetTop + element!.offsetHeight / 2
						if (i > 0) dividers.push(avg(dividers.at(-1)!, storyPos))
						dividers.push(storyPos)
					})
					return dividers
				})(),
			}
		})

		set(dividersAtom, [epicDividers, featureDividers, storyDividers])
		set(pendingDomChangesAtom, (prev) => prev.filter(({id}) => id !== reason))
	}
	return {}
})
