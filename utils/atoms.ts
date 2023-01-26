import {atom} from "jotai"

import type {Id} from "~/types"
import type {Product} from "~/types/db/Products"

export const userIdAtom = atom<Id | undefined>(undefined)

export const activeProductAtom = atom<Product | undefined>(undefined)
