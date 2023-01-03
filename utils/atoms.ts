import {atom} from "jotai"

import type {Id} from "~/types"

export const userIdAtom = atom<Id | null>(null)
