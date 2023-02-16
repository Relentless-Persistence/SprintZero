import {ReadOutlined} from "@ant-design/icons"
import clsx from "clsx"
import {useEffect, useRef, useState} from "react"

import type {StoryMapMeta} from "./meta"
import type {FC} from "react"
import type {Id} from "~/types"

import {elementRegistry} from "./globals"

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

	return (
		<div
			className={clsx(
				`flex touch-none select-none items-center gap-2 rounded border border-current bg-white px-2 py-1 font-medium text-[#4f2dc8] active:cursor-grabbing`,
				inert ? `cursor-grabbing` : `cursor-grab`,
			)}
			ref={contentRef}
		>
			<ReadOutlined />
			<div className="relative min-w-[1rem]">
				<p>{localEpicName || `_`}</p>
				<input
					value={localEpicName}
					className="absolute inset-0"
					onChange={(e) => {
						setLocalEpicName(e.target.value)
						meta.updateEpic(epic.id, {name: e.target.value}).catch(console.error)
					}}
					onPointerDownCapture={(e) => e.stopPropagation()}
				/>
			</div>
		</div>
	)
}

export default Epic
