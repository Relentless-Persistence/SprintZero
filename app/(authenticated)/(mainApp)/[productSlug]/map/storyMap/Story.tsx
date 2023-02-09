import clsx from "clsx"
import {collection, documentId, query, where} from "firebase/firestore"
import {useEffect, useRef, useState} from "react"
import {useCollectionData} from "react-firebase-hooks/firestore"

import type {StoryMapMeta} from "./utils/meta"
import type {FC} from "react"
import type {Id} from "~/types"

import StoryDrawer from "./StoryDrawer"
import {elementRegistry} from "./utils/globals"
import {StoryMapStates} from "~/types/db/StoryMapStates"
import {VersionConverter, Versions} from "~/types/db/Versions"
import {db} from "~/utils/firebase"

export type StoryProps = {
	meta: StoryMapMeta
	storyId: Id
	inert?: boolean
}

const Story: FC<StoryProps> = ({meta, storyId, inert = false}) => {
	const story = meta.stories.find((story) => story.id === storyId)!

	const containerRef = useRef<HTMLDivElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		if (inert || !containerRef.current || !contentRef.current) return
		elementRegistry[story.id] = {
			container: containerRef.current,
			content: contentRef.current,
		}
		return () => {
			if (!containerRef.current || !contentRef.current) return
			elementRegistry[story.id] = {
				// eslint-disable-next-line react-hooks/exhaustive-deps
				container: containerRef.current,
				// eslint-disable-next-line react-hooks/exhaustive-deps
				content: contentRef.current,
			}
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
		<div className={clsx(`p-1.5`)} ref={containerRef}>
			<div className="cursor-grab touch-none select-none transition-transform hover:scale-105" ref={contentRef}>
				<div className="flex min-w-[4rem] items-center gap-1 overflow-hidden rounded border border-laurel bg-[#f5fbf0] pr-1 text-laurel">
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
			</div>

			<StoryDrawer meta={meta} storyId={storyId} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
		</div>
	)
}

export default Story
