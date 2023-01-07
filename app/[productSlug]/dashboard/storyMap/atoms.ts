import {atom} from "jotai"

import type {Id} from "~/types"
import type {Epic} from "~/types/db/Epics"
import type {Feature} from "~/types/db/Features"
import type {Story} from "~/types/db/Stories"

export const currentVersionAtom = atom<Id | `__ALL_VERSIONS__`>(`__ALL_VERSIONS__`)
export const newVersionInputAtom = atom<string | null>(null)

type StoryMapState = Array<{epic: Id; featuresOrder: Array<{feature: Id; storiesOrder: Array<{story: Id}>}>}>
export const storyMapStateAtom = atom<StoryMapState>([])

export const epicsAtom = atom<Epic[]>([])
export const featuresAtom = atom<Feature[]>([])
export const storiesAtom = atom<Story[]>([])
