import clsx from "clsx"
import {collection, documentId, query, where} from "firebase/firestore"
import {useEffect, useRef, useState} from "react"
import {useCollectionData} from "react-firebase-hooks/firestore"

import type {StoryMapMeta} from "./utils/meta"
import type {DragInfo} from "./utils/types"
import type {FC} from "react"
import type {Id} from "~/types"

import StoryDrawer from "./StoryDrawer"
import {elementRegistry} from "./utils/globals"
import {StoryMapStates} from "~/types/db/StoryMapStates"
import {VersionConverter, Versions} from "~/types/db/Versions"
import {db} from "~/utils/firebase"

export type StoryProps = {
	meta: StoryMapMeta
	dragInfo: DragInfo
	storyId: Id
	inert?: boolean
}

const Story: FC<StoryProps> = ({meta, dragInfo, storyId, inert = false}) => {
	const story = meta.stories.find((story) => story.id === storyId)!

	const contentRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		if (inert || !contentRef.current) return
		elementRegistry[story.id] = contentRef.current
		return () => {
			if (!contentRef.current) return
			elementRegistry[story.id] = contentRef.current // eslint-disable-line react-hooks/exhaustive-deps
		}
	}, [story.id, inert])

	const [isDrawerOpen, setIsDrawerOpen] = useState(false)

	const [versions] = useCollectionData(
		query(
			collection(db, StoryMapStates._, meta.id, Versions._),
			where(documentId(), `==`, story.versionId),
		).withConverter(VersionConverter),
	)
	const version = versions?.[0]

	return (
		// Don't delete this wrapper div. Epics and features require a .parentElement lookup for drag-and-drop offset, so
		// I artifically added a wrapper div here to keep the same structure as everything else.
		<div>
			<div
				className={clsx(
					`flex min-w-[4rem] touch-none select-none items-center gap-1 overflow-hidden rounded border border-laurel bg-[#f5fbf0] pr-1 text-laurel transition-transform hover:scale-105 active:cursor-grabbing`,
					inert ? `cursor-grabbing` : `cursor-grab`,
					dragInfo.itemBeingDragged === storyId && !inert && `invisible`,
				)}
				ref={contentRef}
			>
				<button
					type="button"
					onClick={() => setIsDrawerOpen(true)}
					onPointerDownCapture={(e) => e.stopPropagation()}
					className="border-r-[1px] border-[#aee383] bg-[#e1f4d1] p-0.5 text-[0.6rem]"
				>
					<p className="-rotate-90">{version?.name}</p>
				</button>
				<div className="mx-auto px-1 text-xs text-black">
					<p>{story.name}</p>
				</div>
			</div>

			<StoryDrawer meta={meta} storyId={storyId} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
		</div>
	)
}

export default Story
