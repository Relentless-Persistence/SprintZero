import {createContext, useContext} from "react"

import type {QueryDocumentSnapshot, QuerySnapshot} from "firebase/firestore"
import type {Dispatch, SetStateAction} from "react"
import type {Product} from "~/types/db/Products"
import type {StoryMapItem} from "~/types/db/Products/StoryMapItems"
import type {Version} from "~/types/db/Products/Versions"

export const StoryMapContext = createContext<{
	product: QueryDocumentSnapshot<Product>
	storyMapItems: QuerySnapshot<StoryMapItem>
	versions: QuerySnapshot<Version>
	editMode: boolean

	currentVersionId: string
	setCurrentVersionId: Dispatch<SetStateAction<string>>
	newVersionInputValue: string | undefined
	setNewVersionInputValue: Dispatch<SetStateAction<string | undefined>>
	itemsToBeDeleted: string[]
	setItemsToBeDeleted: Dispatch<SetStateAction<string[]>>
	versionsToBeDeleted: string[]
	setVersionsToBeDeleted: Dispatch<SetStateAction<string[]>>
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
}>(undefined as any)

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useStoryMapContext = () => useContext(StoryMapContext)
