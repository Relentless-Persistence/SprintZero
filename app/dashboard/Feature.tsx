"use client"

import {CopyOutlined} from "@ant-design/icons"
import {useMutation} from "@tanstack/react-query"
import {Button, Drawer} from "antd5"
import TextArea from "antd5/es/input/TextArea"
import clsx from "clsx"
import {useCallback, useState} from "react"

import type {FC} from "react"
import type {Id} from "~/types"
import type {Feature as FeatureType} from "~/types/db/Features"

import Draggable from "./Draggable"
import Story from "./Story"
import {useStoryMapStore} from "./storyMapStore"
import useMainStore from "~/stores/mainStore"
import {addStory, renameFeature} from "~/utils/fetch"

export type FeatureProps = {
	epicId: Id
	feature: FeatureType
}

const Feature: FC<FeatureProps> = ({epicId, feature}) => {
	const activeProductId = useMainStore((state) => state.activeProductId)
	const currentVersion = useStoryMapStore((state) => state.currentVersion)
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const [isActive, setIsActive] = useState(false)
	const registerElement = useStoryMapStore((state) => state.registerElement)

	const stories = useStoryMapStore((state) =>
		Array.from(state.stories.values())
			.map((story) => story.story)
			.filter((story) => story.feature === feature.id),
	)

	const addStoryMutation = useMutation({
		mutationFn: addStory(activeProductId!, epicId, feature.id),
	})

	const renameFeatureMutation = useMutation({mutationFn: renameFeature(feature.id)})

	const ref = useCallback(
		(node: HTMLDivElement | null) => {
			if (!node) return
			registerElement(1, feature.id, node)
		},
		[feature.id, registerElement],
	)

	return (
		<>
			<Draggable onActiveStart={() => void setIsActive(true)} onActiveEnd={() => void setIsActive(false)} ref={ref}>
				<div
					className={clsx(
						`flex flex-col items-center rounded-md p-4 transition-colors`,
						isActive && `cursor-grab bg-[#00000022]`,
					)}
				>
					<div className="flex min-w-[4rem] items-center gap-2 rounded-md border border-[#006378] bg-white px-2 py-1 text-[#006378]">
						<button type="button" onClick={() => void setIsDrawerOpen(true)}>
							<CopyOutlined />
						</button>
						<Draggable.Input value={feature.name} onChange={(value) => void renameFeatureMutation.mutate(value)} />
					</div>

					<div className="flex items-center">
						<div className="flex items-center">
							<div className="mt-4 flex gap-1">
								{stories.map((story) => (
									<Story key={story.id} story={story} />
								))}
							</div>
						</div>
						{currentVersion !== `__ALL_VERSIONS__` && (
							<div className="p-4">
								<Button
									onClick={() =>
										void addStoryMutation.mutate({
											name: `story`,
											description: `description`,
											version: currentVersion,
										})
									}
									className="bg-white"
								>
									Add story
								</Button>
							</div>
						)}
					</div>
				</div>
			</Draggable>

			<Drawer
				title={feature.name}
				placement="bottom"
				closable={false}
				open={isDrawerOpen}
				onClose={() => void setIsDrawerOpen(false)}
			>
				<p>Feature</p>
				<TextArea />
			</Drawer>
		</>
	)
}

export default Feature
