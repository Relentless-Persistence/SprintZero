import {CopyOutlined, PlusOutlined, ReadOutlined} from "@ant-design/icons"
import clsx from "clsx"
import {useEffect, useRef, useState} from "react"

import type {StoryMapMeta} from "./utils/meta"
import type {DragInfo} from "./utils/types"
import type {FC} from "react"
import type {Id} from "~/types"

import EpicDrawer from "./EpicDrawer"
import Feature from "./Feature"
import {elementRegistry} from "./utils/globals"

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

	const [isDrawerOpen, setIsDrawerOpen] = useState(false)

	return (
		<div
			className={clsx(
				`grid justify-items-center gap-x-4`,
				dragInfo.itemBeingDragged === epicId && !inert && `invisible`,
			)}
			style={{gridTemplateColumns: `repeat(${epic.children.length}, auto)`}}
		>
			<div
				className={clsx(
					`flex min-w-[4rem] touch-none select-none items-center gap-2 rounded-md border border-[#4f2dc8] bg-white px-2 py-1 text-[#4f2dc8] transition-transform hover:scale-105 active:cursor-grabbing`,
					inert ? `cursor-grabbing` : `cursor-grab`,
				)}
				ref={contentRef}
			>
				<button type="button" onClick={() => setIsDrawerOpen(true)} onPointerDownCapture={(e) => e.stopPropagation()}>
					<ReadOutlined />
				</button>
				<p>{epic.name}</p>
			</div>

			{/* Pad out the remaining columns in row 1 */}
			{Array(Math.max(epic.children.length - 1, 0))
				.fill(undefined)
				.map((_, i) => (
					<div key={`row1-${i}`} />
				))}

			{/* Pad out the beginning columns in row 2 */}
			{Array(Math.max(epic.children.length, 1))
				.fill(undefined)
				.map((_, i) => (
					<div key={`row2-${i}`} className="relative h-16 w-[calc(100%+1rem-2px)]">
						{/* Top */}
						{i === 0 && (
							<div className="absolute left-1/2 top-0 h-[calc(50%-2px)] w-px -translate-x-1/2 border border-dashed border-[#4f2dc8]" />
						)}
						{/* Right */}
						{i < epic.children.length - 1 && (
							<div className="absolute left-1/2 top-1/2 h-px w-1/2 -translate-y-1/2 border border-dashed border-[#4f2dc8]" />
						)}
						{/* Bottom */}
						<div className="absolute left-1/2 top-1/2 h-1/2 w-px -translate-x-1/2 border border-dashed border-[#4f2dc8]" />
						{/* Left */}
						{i > 0 && (
							<div className="absolute left-0 top-1/2 h-px w-1/2 -translate-y-1/2 border border-dashed border-[#4f2dc8]" />
						)}

						{i === epic.children.length - 1 && epic.children.length > 0 && (
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

			{epic.children.map((feature) => (
				<Feature key={feature.id} meta={meta} dragInfo={dragInfo} featureId={feature.id} inert={inert} />
			))}

			{epic.children.length === 0 && (
				<button
					type="button"
					onClick={() => {
						meta.addFeature({parentId: epicId}).catch(console.error)
					}}
					className="flex items-center gap-2 rounded-md border border-dashed border-[currentColor] bg-white px-2 py-1 text-[#006378] transition-colors hover:bg-[#f2fbfe]"
				>
					<CopyOutlined />
					<span>Add feature</span>
				</button>
			)}

			<EpicDrawer meta={meta} epicId={epicId} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
		</div>
	)
}

export default Epic
