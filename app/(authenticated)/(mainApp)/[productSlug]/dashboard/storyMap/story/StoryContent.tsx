import {collection, documentId, query, where} from "firebase/firestore"
import {forwardRef, useState} from "react"
import {useCollectionData} from "react-firebase-hooks/firestore"

import type {ForwardRefRenderFunction} from "react"
import type {WithDocumentData} from "~/types"
import type {Product} from "~/types/db/Products"
import type {StoryMapState} from "~/types/db/StoryMapStates"

import StoryDrawer from "~/components/StoryDrawer"
import {StoryMapStates} from "~/types/db/StoryMapStates"
import {VersionConverter, Versions} from "~/types/db/Versions"
import {db} from "~/utils/firebase"

export type StoryContentProps = {
	activeProduct: WithDocumentData<Product>
	storyMapState: WithDocumentData<StoryMapState>
	storyId: string
}

const StoryContent: ForwardRefRenderFunction<HTMLDivElement, StoryContentProps> = (
	{activeProduct, storyMapState, storyId},
	ref,
) => {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)

	const story = storyMapState.stories.find((story) => story.id === storyId)!
	const [versions] = useCollectionData(
		query(
			collection(db, StoryMapStates._, storyMapState.id, Versions._),
			where(documentId(), `==`, story.versionId),
		).withConverter(VersionConverter),
	)
	const version = versions?.[0]

	return (
		<>
			<div
				className="flex min-w-[4rem] items-center gap-1 overflow-hidden rounded border border-laurel bg-green-t1300 pr-1 text-laurel"
				ref={ref}
			>
				<button
					type="button"
					onClick={() => void setIsDrawerOpen(true)}
					onPointerDownCapture={(e) => void e.stopPropagation()}
					className="border-r-[1px] border-laurel bg-green-t1200 p-0.5 text-[0.6rem]"
				>
					<p className="-rotate-90">{version?.name}</p>
				</button>
				<div className="mx-auto px-1 text-xs text-black">
					<p>{story.name}</p>
				</div>
			</div>

			<StoryDrawer
				activeProduct={activeProduct}
				storyMapState={storyMapState}
				storyId={storyId}
				hideAdjudicationResponse
				isOpen={isDrawerOpen}
				onClose={() => void setIsDrawerOpen(false)}
			/>
		</>
	)
}

export default forwardRef(StoryContent)
