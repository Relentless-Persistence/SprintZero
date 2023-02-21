import {MinusCircleOutlined, ReadOutlined} from "@ant-design/icons"
import clsx from "clsx"
import {useEffect, useRef, useState} from "react"

import type {StoryMapMeta} from "./meta"
import type {FC} from "react"
import type {Id} from "~/types"

import {elementRegistry} from "./globals"
import {updateItem} from "~/utils/storyMap"

export type EpicProps = {
	meta: StoryMapMeta
	epicId: Id
	inert?: boolean
}

const Epic: FC<EpicProps> = ({meta, epicId, inert = false}) => {
	const epic = meta.epics.find((epic) => epic.id === epicId)!

	const contentRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		if (inert || !contentRef.current) return
		elementRegistry[epicId] = contentRef.current
		return () => {
			if (!contentRef.current) return
			elementRegistry[epicId] = contentRef.current // eslint-disable-line react-hooks/exhaustive-deps
		}
	}, [epicId, inert])

	const [localEpicName, setLocalEpicName] = useState(epic.name)
	useEffect(() => {
		setLocalEpicName(epic.name)
	}, [epic.name])

	return (
		<div
			className={clsx(
				`flex touch-none select-none items-center gap-2 rounded border border-current bg-white px-2 py-1 font-medium`,
				inert && `cursor-grabbing`,
				meta.editMode ? `text-[#ff4d4f]` : `cursor-grab text-[#4f2dc8] active:cursor-grabbing`,
			)}
			ref={contentRef}
		>
			{meta.editMode ? (
				<button
					type="button"
					onClick={() => {
						meta.markForDeletion(epicId)
						epic.childrenIds.forEach((featureId) => {
							meta.markForDeletion(featureId)
							const storyIds = meta.features.find((feature) => feature.id === featureId)!.childrenIds
							storyIds.forEach((storyId) => meta.markForDeletion(storyId))
						})
					}}
				>
					<MinusCircleOutlined />
				</button>
			) : (
				<ReadOutlined />
			)}
			<div className="relative min-w-[1rem]">
				<p>{localEpicName || `_`}</p>
				<input
					value={localEpicName}
					className="absolute inset-0"
					onChange={(e) => {
						setLocalEpicName(e.target.value)
						updateItem(meta.storyMapState, epic.id, {name: e.target.value}, meta.allVersions).catch(console.error)
					}}
					onPointerDownCapture={(e) => e.stopPropagation()}
				/>
			</div>
		</div>
	)
}

export default Epic
