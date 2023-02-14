import {CopyOutlined, PlusOutlined, ReadOutlined} from "@ant-design/icons"
import clsx from "clsx"
import {useEffect, useRef} from "react"

import type {StoryMapMeta} from "./meta"
import type {DragInfo} from "./types"
import type {FC} from "react"
import type {Id} from "~/types"

import Feature from "./Feature"
import {elementRegistry} from "./globals"

export type EpicProps = {
	meta: StoryMapMeta
	dragInfo: DragInfo
	epicId: Id
	inert?: boolean
}

const Epic: FC<EpicProps> = ({meta, dragInfo, epicId, inert = false}) => {
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

	return (
		<div
			className={clsx(
				`grid justify-items-center gap-x-6`,
				dragInfo.itemBeingDraggedId === epicId && !inert && `invisible`,
			)}
			style={{gridTemplateColumns: `repeat(${epic.childrenIds.length}, auto)`}}
		>
			<div
				className={clsx(
					`flex touch-none select-none items-center gap-2 rounded border border-current bg-white px-2 py-1 font-medium text-[#4f2dc8] active:cursor-grabbing`,
					inert ? `cursor-grabbing` : `cursor-grab`,
				)}
				ref={contentRef}
			>
				<ReadOutlined />
				<p>{epic.name}</p>
			</div>

			{/* Pad out the remaining columns in row 1 */}
			{Array(Math.max(epic.childrenIds.length - 1, 0))
				.fill(undefined)
				.map((_, i) => (
					<div key={`row1-${i}`} />
				))}

			{/* Pad out the beginning columns in row 2 */}
			{Array(Math.max(epic.childrenIds.length, 1))
				.fill(undefined)
				.map((_, i) => (
					<div key={`row2-${i}`} className="relative h-16 w-[calc(100%+1.5rem)]">
						{/* Top */}
						{i === 0 && <div className="absolute left-1/2 top-0 h-1/2 w-px -translate-x-1/2 border border-[#d0d0d0]" />}
						{/* Right */}
						{i < epic.childrenIds.length - 1 && (
							<div className="absolute left-1/2 top-1/2 h-px w-1/2 -translate-y-1/2 border border-[#d0d0d0]" />
						)}
						{/* Bottom */}
						<div className="absolute left-1/2 top-1/2 h-1/2 w-px -translate-x-1/2 border border-[#d0d0d0]" />
						{/* Left */}
						{i > 0 && <div className="absolute left-0 top-1/2 h-px w-1/2 -translate-y-1/2 border border-[#d0d0d0]" />}

						{i === epic.childrenIds.length - 1 && epic.childrenIds.length > 0 && (
							<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
								<button
									type="button"
									onClick={() => {
										meta.addFeature({parentId: epicId}).catch(console.error)
									}}
									className="grid h-4 w-4 place-items-center rounded-full bg-green text-[0.6rem] text-white"
								>
									<PlusOutlined />
								</button>
							</div>
						)}
					</div>
				))}

			{epic.childrenIds
				.map((id) => meta.features.find((feature) => id === feature.id)!)
				.map((feature) => (
					<Feature key={feature.id} meta={meta} dragInfo={dragInfo} featureId={feature.id} inert={inert} />
				))}

			{epic.childrenIds.length === 0 && (
				<button
					type="button"
					onClick={() => {
						meta.addFeature({parentId: epicId}).catch(console.error)
					}}
					className="flex items-center gap-2 rounded border border-dashed border-current bg-white px-2 py-1 font-medium text-[#006378]"
				>
					<CopyOutlined />
					<span>Add feature</span>
				</button>
			)}
		</div>
	)
}

export default Epic
