import {MinusCircleOutlined} from "@ant-design/icons"
import clsx from "clsx"
import {updateDoc} from "firebase/firestore"
import {useEffect, useRef, useState} from "react"

import type {QueryDocumentSnapshot, QuerySnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {Product} from "~/types/db/Products"
import type {StoryMapItem} from "~/types/db/Products/StoryMapItems"
import type {Version} from "~/types/db/Products/Versions"

import {elementRegistry} from "./globals"
import StoryDrawer from "./StoryDrawer"
import {updateItem} from "~/utils/storyMap"

export type StoryProps = {
	product: QueryDocumentSnapshot<Product>
	storyMapItems: QuerySnapshot<StoryMapItem>
	versions: QuerySnapshot<Version>
	storyId: string
	editMode: boolean
	onMarkForDeletion: () => void
	inert?: boolean
}

const Story: FC<StoryProps> = ({
	product,
	storyMapItems,
	versions,
	storyId,
	editMode,
	onMarkForDeletion,
	inert = false,
}) => {
	const story = storyMapItems.docs.find((story) => story.id === storyId)!

	const contentRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		if (inert || !contentRef.current) return
		elementRegistry[story.id] = contentRef.current
		return () => {
			if (!contentRef.current) return
			elementRegistry[story.id] = contentRef.current // eslint-disable-line react-hooks/exhaustive-deps
		}
	}, [story.id, inert])

	const version = versions.docs.find((version) => version.id === story.data().versionId)

	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const [localStoryName, setLocalStoryName] = useState(story.data().name)
	useEffect(() => {
		setLocalStoryName(story.data().name)
	}, [story])

	return (
		<div
			className={clsx(
				`flex touch-none select-none items-center overflow-hidden rounded border border-[#d9d9d9] bg-white font-medium dark:border-[#757575] dark:bg-black`,
				inert && `cursor-grabbing`,
				!editMode && `cursor-grab  active:cursor-grabbing`,
			)}
			ref={contentRef}
		>
			<button
				type="button"
				onClick={() => setIsDrawerOpen(true)}
				onPointerDownCapture={(e) => e.stopPropagation()}
				className="border-r border-[#d9d9d9] bg-[#f1f2f5] p-2 text-xs dark:border-[#757575] dark:bg-[#333333]"
			>
				<p className="max-h-8 w-[1em] truncate leading-none [writing-mode:vertical-lr]">{version?.data().name}</p>
			</button>
			<div className="flex items-center gap-2 px-2 leading-tight">
				{(story.data().initialRenameDone || inert) && !editMode ? (
					<p className={clsx(`my-0.5`, localStoryName === `` && `invisible`)}>{localStoryName || `_`}</p>
				) : (
					<div className="relative my-0.5 mx-auto min-w-[1rem]">
						<p>{localStoryName || `_`}</p>
						<input
							value={localStoryName}
							autoFocus={!story.data().initialRenameDone && !editMode}
							onBlur={() => {
								updateDoc(story.ref, {initialRenameDone: true}).catch(console.error)
							}}
							onKeyDown={(e) => {
								if (e.key === `Enter`) updateDoc(story.ref, {initialRenameDone: true}).catch(console.error)
							}}
							className="absolute inset-0 w-full rounded-sm bg-bgContainer focus:outline focus:outline-1 focus:outline-offset-1 focus:outline-primaryHover"
							onChange={(e) => {
								setLocalStoryName(e.target.value)
								updateItem(product, storyMapItems, story.id, {name: e.target.value}, versions).catch(console.error)
							}}
							onPointerDownCapture={(e) => e.stopPropagation()}
						/>
					</div>
				)}
				{editMode && (
					<button type="button" onClick={() => onMarkForDeletion()}>
						<MinusCircleOutlined className="text-sm text-error" />
					</button>
				)}
			</div>

			<StoryDrawer
				product={product}
				storyMapItems={storyMapItems}
				versions={versions}
				storyId={storyId}
				isOpen={isDrawerOpen}
				onClose={() => setIsDrawerOpen(false)}
			/>
		</div>
	)
}

export default Story
