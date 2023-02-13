import clsx from "clsx"
import {collection, documentId, query, where} from "firebase/firestore"
import {useEffect, useRef, useState} from "react"
import {useCollectionData} from "react-firebase-hooks/firestore"

import type {StoryMapMeta} from "./meta"
import type {DragInfo} from "./types"
import type {FC} from "react"
import type {Id} from "~/types"

import {elementRegistry} from "./globals"
import StoryDrawer from "./StoryDrawer"
import {VersionConverter} from "~/types/db/Versions"
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
			collection(db, `StoryMapStates`, meta.id, `Versions`),
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
					`flex touch-none select-none items-center gap-1 overflow-hidden rounded border-2 border-[#103001] bg-white pr-1 transition-transform hover:scale-105 active:cursor-grabbing`,
					inert ? `cursor-grabbing` : `cursor-grab`,
					dragInfo.itemBeingDraggedId === storyId && !inert && `invisible`,
				)}
				ref={contentRef}
			>
				<button
					type="button"
					onClick={() => setIsDrawerOpen(true)}
					onPointerDownCapture={(e) => e.stopPropagation()}
					className="border-r border-[#103001] bg-[#f5f5f5] p-2 text-[0.6rem]"
				>
					<p className="leading-none [writing-mode:vertical-lr]">{version?.name}</p>
				</button>
				<div className="mx-auto px-2 font-medium text-black">
					<p>{story.name}</p>
				</div>
			</div>

			<StoryDrawer meta={meta} storyId={storyId} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
		</div>
	)
}

export default Story
