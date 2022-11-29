"use client"

import {ReadOutlined} from "@ant-design/icons"
import {useMutation} from "@tanstack/react-query"
import {Button, Drawer} from "antd5"
import TextArea from "antd5/es/input/TextArea"
import clsx from "clsx"
import {useCallback, useState} from "react"

import type {FC} from "react"
import type {Epic as EpicType} from "~/types/db/Epics"

import Draggable, {useIsHovering} from "./Draggable"
import {useStoryMapStore} from "./storyMapStore"
import Feature from "~/app/dashboard/Feature"
import useMainStore from "~/stores/mainStore"
import {addFeature, renameEpic} from "~/utils/fetch"

export type EpicProps = {
	epic: EpicType
}

const Epic: FC<EpicProps> = ({epic}) => {
	const activeProductId = useMainStore((state) => state.activeProductId)
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const registerElement = useStoryMapStore((state) => state.registerElement)
	const isActive = useIsHovering(0, epic.id)

	const features = useStoryMapStore((state) =>
		Array.from(state.features.values())
			.map((feature) => feature.feature)
			.filter((feature) => feature.epic === epic.id),
	)

	const addFeatureMutation = useMutation({
		mutationFn: addFeature(activeProductId!, epic.id),
	})

	const renameEpicMutation = useMutation({mutationFn: renameEpic(epic.id)})

	const ref = useCallback(
		(node: HTMLDivElement | null) => {
			if (!node) return
			registerElement(0, epic.id, node)
		},
		[epic.id, registerElement],
	)

	return (
		<>
			<Draggable layer={0} id={epic.id} ref={ref}>
				<div
					className={clsx(
						`flex flex-col items-center gap-4 rounded-md p-4 transition-colors`,
						isActive && `cursor-grab bg-[#00000011]`,
					)}
				>
					<div className="flex min-w-[4rem] items-center gap-2 rounded-md border border-[#4f2dc8] bg-white px-2 py-1 text-[#4f2dc8]">
						<button type="button" onClick={() => void setIsDrawerOpen(true)} data-nondraggable>
							<ReadOutlined />
						</button>
						<Draggable.Input value={epic.name} onChange={(value) => void renameEpicMutation.mutate(value)} />
					</div>
					<div className="flex items-center">
						<div className="flex gap-1">
							{features.map((feature) => (
								<Feature key={feature.id} epicId={epic.id} feature={feature} />
							))}
						</div>
						<div className="p-4">
							<Button
								onClick={() => void addFeatureMutation.mutate({name: `feature`, description: `description`})}
								className="bg-white"
							>
								Add feature
							</Button>
						</div>
					</div>
				</div>
			</Draggable>

			<Drawer
				title={epic.name}
				placement="bottom"
				closable={false}
				open={isDrawerOpen}
				onClose={() => void setIsDrawerOpen(false)}
			>
				<p>Epic</p>
				<TextArea />
			</Drawer>
		</>
	)
}

export default Epic
