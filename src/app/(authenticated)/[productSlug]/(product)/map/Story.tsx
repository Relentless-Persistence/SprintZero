import { MinusCircleOutlined } from "@ant-design/icons"
import clsx from "clsx"
import { doc, updateDoc } from "firebase/firestore"
import { motion, useAnimationFrame } from "framer-motion"
import { useEffect, useRef, useState } from "react"

import type { DragInfo } from "./types"
import type { FC } from "react"

import { elementRegistry } from "./globals"
import { useStoryMapContext } from "./StoryMapContext"
import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import StoryDrawer from "~/components/StoryDrawer"
import { updateItem } from "~/utils/storyMap"
import { trpc } from "~/utils/trpc"

export type StoryProps = {
	storyId: string
	dragInfo: DragInfo
	inert?: boolean
}

const Story: FC<StoryProps> = ({ storyId, dragInfo, inert = false }) => {
	const { product, user } = useAppContext()
	const { storyMapItems, versions, editMode, setItemsToBeDeleted } = useStoryMapContext()
	const genStoryDesc = trpc.gpt4.useMutation()

	const story = storyMapItems.find((story) => story.id === storyId)!
	// const feature = storyMapItems.find((feature) => feature.id === story.parentId)!

	const containerRef = useRef<HTMLDivElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)
	useAnimationFrame(() => {
		if (dragInfo.itemBeingDraggedId === undefined || inert)
			elementRegistry[storyId] = {
				container: containerRef.current ?? undefined,
				content: contentRef.current ?? undefined,
			}
	})

	// ScrumGenie: Generate a user story description
	const sgGenUserStory = async () => {
		const storyName = localStoryName
		const feature = storyMapItems.find((item) => item.id === story.parentId)
		const featureName = feature?.name
		const epicName = storyMapItems.find((item) => item.id === feature?.parentId)?.name

		const newStoryDescRaw = await genStoryDesc.mutateAsync({
			prompt: `We are a team building a product. Help us to write a complete user story described as a "user story template". The user story belongs to a feature called "${featureName ?? ``}". And the feature belongs to an epic called "${epicName ?? ``}". And the user story has a short name "${storyName ?? ``}". Your output should include only one sentence.`,
		})

		console.log(newStoryDescRaw)

		const newStoryDesc = newStoryDescRaw.response
			?.split(`\n`)
			.map((s) => s.replace(/^[0-9]+\. */, ``))
			.filter((s) => s !== ``)[0]

		console.log(newStoryDesc)

		if (!story.description && newStoryDesc) {
			await updateItem(product, storyMapItems, versions, story.id, { description: newStoryDesc }).catch(console.error)
			setIsStoryGenInProgress(false);
		}
	}

	const version = versions.docs.find((version) => version.id === story.versionId)

	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const [isStoryGenInProgress, setIsStoryGenInProgress] = useState(false)
	const [localStoryName, setLocalStoryName] = useState(story.name)
	useEffect(() => {
		setLocalStoryName(story.name)
	}, [story.name])

	// const isParentMoving =
	// 	dragInfo.itemBeingDraggedId === story.parentId || dragInfo.itemBeingDraggedId === feature.parentId

	return (
		<div ref={containerRef}>
			<motion.div
				// layoutId={storyId}
				// layout={isParentMoving ? false : `position`}
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
								autoFocus={!story.initialRenameDone && !editMode && user.id === story.updatedAtUserId}
								onFocus={(e) => e.target.select()}
								onBlur={() => {
									if (localStoryName !== ``)
										updateDoc(doc(product.ref, `StoryMapItems`, storyId), { initialRenameDone: true }).catch(
											console.error,
										)
								}}
								onKeyDown={(e) => {
									if (e.key === `Enter`) {
										setIsStoryGenInProgress(true)
										updateDoc(doc(product.ref, `StoryMapItems`, storyId), { initialRenameDone: true }).catch(
											console.error,
										)

										sgGenUserStory()
									}
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
									updateItem(product, storyMapItems, versions, story.id, { name: e.target.value }).catch(console.error)
								}}
								onPointerDownCapture={(e) => e.stopPropagation()}
							/>
						</div>
					)}
					{editMode && (
						<button type="button" onClick={() => setItemsToBeDeleted((prev) => [...prev, storyId])}>
							<MinusCircleOutlined className="text-sm text-error" />
						</button>
					)}
				</div>
			</motion.div>

			<StoryDrawer
				storyMapItems={storyMapItems}
				versions={versions}
				storyId={storyId}
				isOpen={isDrawerOpen}
				//isUsGenInProgress={isStoryGenInProgress}
				onClose={() => setIsDrawerOpen(false)}
			/>
		</div>
	)
}

export default Story
