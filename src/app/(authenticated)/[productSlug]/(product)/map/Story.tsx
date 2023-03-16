import {MinusCircleOutlined} from "@ant-design/icons"
import clsx from "clsx"
import {doc, updateDoc} from "firebase/firestore"
import {useAnimationFrame} from "framer-motion"
import {useEffect, useRef, useState} from "react"

import type {DragInfo} from "./types"
import type {FC} from "react"

import {elementRegistry} from "./globals"
import {useStoryMapContext} from "./StoryMapContext"
import {useAppContext} from "~/app/(authenticated)/[productSlug]/AppContext"
import StoryDrawer from "~/components/StoryDrawer"
import {updateItem} from "~/utils/storyMap"

export type StoryProps = {
	storyId: string
	dragInfo: DragInfo
	onMarkForDeletion: () => void
	inert?: boolean
}

const Story: FC<StoryProps> = ({storyId, dragInfo, onMarkForDeletion, inert = false}) => {
	const {product} = useAppContext()
	const {storyMapItems, versions, editMode} = useStoryMapContext()

	const story = storyMapItems.find((story) => story.id === storyId)!

	const contentRef = useRef<HTMLDivElement>(null)
	useAnimationFrame(() => {
		elementRegistry[storyId] = {container: contentRef.current ?? undefined, content: contentRef.current ?? undefined}
	})

	const version = versions.docs.find((version) => version.id === story.versionId)

	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const [localStoryName, setLocalStoryName] = useState(story.name)
	useEffect(() => {
		setLocalStoryName(story.name)
	}, [story.name])

	return (
		<div
			className={clsx(
				`flex touch-none select-none items-center overflow-hidden rounded border border-[#d9d9d9] bg-white font-medium dark:border-[#757575] dark:bg-black`,
				inert && `cursor-grabbing`,
				!editMode && `cursor-grab  active:cursor-grabbing`,
				dragInfo.itemBeingDraggedId === story.id && !inert && `invisible`,
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
				{(story.initialRenameDone || inert) && !editMode ? (
					<p className={clsx(`m-0.5`, localStoryName === `` && `invisible`)}>{localStoryName || `_`}</p>
				) : (
					<div className="relative my-0.5 mx-auto min-w-[1rem]">
						<p className="px-0.5">{localStoryName || `_`}</p>
						<input
							value={localStoryName}
							autoFocus={!story.initialRenameDone && !editMode}
							onFocus={(e) => e.target.select()}
							onBlur={() => {
								if (localStoryName !== ``)
									updateDoc(doc(product.ref, `StoryMapItems`, storyId), {initialRenameDone: true}).catch(console.error)
							}}
							onKeyDown={(e) => {
								if (e.key === `Enter`)
									updateDoc(doc(product.ref, `StoryMapItems`, storyId), {initialRenameDone: true}).catch(console.error)
							}}
							className={clsx(
								`absolute inset-0 w-full rounded-sm bg-bgContainer px-0.5 outline-none`,
								localStoryName === ``
									? `bg-errorBg outline-2 outline-errorBorder`
									: `focus:outline-2 focus:outline-primaryHover`,
							)}
							onChange={(e) => {
								setLocalStoryName(e.target.value)
								if (e.target.value === ``) return
								updateItem(product, storyMapItems, versions, story.id, {name: e.target.value}).catch(console.error)
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
