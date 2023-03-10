import {createContext, useContext} from "react"

import type {QuerySnapshot} from "firebase/firestore"
import type {Dispatch, SetStateAction} from "react"
import type {StoryMapItem} from "~/types/db/Products/StoryMapItems"
import type {Version} from "~/types/db/Products/Versions"

export const StoryMapContext = createContext<{
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
}>(undefined as never)

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useStoryMapContext = () => useContext(StoryMapContext)
