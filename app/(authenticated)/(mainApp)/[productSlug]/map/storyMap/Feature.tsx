import {CopyOutlined, FileOutlined} from "@ant-design/icons"
import {useEffect, useRef, useState} from "react"

import type {StoryMapMeta} from "./utils/meta"
import type {FC} from "react"
import type {Id} from "~/types"

import FeatureDrawer from "./FeatureDrawer"
import Story from "./Story"
import {elementRegistry} from "./utils/globals"

export type FeatureProps = {
	meta: StoryMapMeta
	currentVersionId: Id | `__ALL_VERSIONS__`
	featureId: Id
	inert?: boolean
}

const Feature: FC<FeatureProps> = ({meta, currentVersionId, featureId, inert = false}) => {
	const feature = meta.features.find((feature) => feature.id === featureId)!

	const containerRef = useRef<HTMLDivElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		if (inert || !containerRef.current || !contentRef.current) return
		elementRegistry[featureId] = {
			container: containerRef.current,
			content: contentRef.current,
		}
		return () => {
			if (!containerRef.current || !contentRef.current) return
			elementRegistry[featureId] = {
				container: containerRef.current, // eslint-disable-line react-hooks/exhaustive-deps
				content: contentRef.current, // eslint-disable-line react-hooks/exhaustive-deps
			}
		}
	}, [featureId, inert])

	const [isDrawerOpen, setIsDrawerOpen] = useState(false)

	return (
		<div className="flex flex-col items-center" ref={containerRef}>
			<div className="cursor-grab touch-none select-none transition-transform hover:scale-105" ref={contentRef}>
				<div className="flex min-w-[4rem] items-center gap-2 rounded-md border border-[#006378] bg-white px-2 py-1 text-[#006378] transition-transform hover:scale-105">
					<button type="button" onClick={() => setIsDrawerOpen(true)} onPointerDownCapture={(e) => e.stopPropagation()}>
						<CopyOutlined />
					</button>
					<p>{feature.name}</p>
				</div>
			</div>

			{(currentVersionId !== `__ALL_VERSIONS__` || feature.children.length > 0) && (
				<div className="h-8 w-px border border-dashed border-[#006378]" />
			)}

			{feature.children.length === 0 ? (
				<button
					type="button"
					onClick={() => {
						if (currentVersionId !== `__ALL_VERSIONS__`) meta.addStory({parentId: featureId}).catch(console.error)
					}}
					className="flex items-center gap-2 rounded-md border border-dashed border-[currentColor] bg-white px-2 py-1 text-[#006378] transition-colors hover:bg-[#f2fbfe]"
				>
					<FileOutlined />
					<span>Add story</span>
				</button>
			) : (
				<div className="flex flex-col items-start rounded-md border border-[#006378] bg-white p-1.5">
					{feature.children.map((story) => (
						<Story key={story.id} meta={meta} storyId={story.id} inert={inert} />
					))}

					{currentVersionId !== `__ALL_VERSIONS__` && (
						<div className="m-1.5">
							<button
								type="button"
								onClick={() => {
									if (currentVersionId !== `__ALL_VERSIONS__`) meta.addStory({parentId: featureId}).catch(console.error)
								}}
								className="flex items-center gap-2 rounded-md border border-dashed border-[currentColor] bg-white px-2 py-1 text-[#006378] transition-colors hover:bg-[#f2fbfe]"
							>
								<FileOutlined />
								<span>Add story</span>
							</button>
						</div>
					)}
				</div>
			)}

			<FeatureDrawer meta={meta} featureId={featureId} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
		</div>
	)
}

export default Feature
