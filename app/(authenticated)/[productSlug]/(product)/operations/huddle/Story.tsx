import {CloseOutlined, CopyOutlined, ReadOutlined} from "@ant-design/icons"
import {Tag} from "antd"

import type {QueryDocumentSnapshot, QuerySnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {Promisable} from "type-fest"
import type {Id} from "~/types"
import type {StoryMapState} from "~/types/db/StoryMapStates"
import type {Version} from "~/types/db/Versions"

export type StoryProps = {
	storyMapState: QueryDocumentSnapshot<StoryMapState>
	versions: QuerySnapshot<Version>
	storyId: Id
	onRemove: () => Promisable<void>
}

const Story: FC<StoryProps> = ({storyMapState, versions, storyId, onRemove}) => {
	const story = storyMapState.data().items[storyId]!
	const feature = Object.entries(storyMapState.data().items).find(([id]) => id === story.parentId)!
	const epic = Object.entries(storyMapState.data().items).find(([id]) => id === feature[1]!.parentId)!

	return (
		<div className="flex items-center overflow-hidden rounded-md border border-border">
			<div className="flex flex-col self-stretch border-r border-border bg-[#f1f2f5] p-2">
				<p className="min-h-0 flex-1 truncate text-center text-xs leading-none [writing-mode:vertical-lr]">
					{versions.docs.find((version) => version.id === story.versionId)?.data().name}
				</p>
			</div>
			<div className="flex grow items-center justify-between gap-2 px-4 py-2">
				<div className="flex flex-col gap-1">
					<p className="-mt-0.5">{story.name}</p>
					<div className="flex gap-2">
						<Tag color="#f9f0ff" icon={<ReadOutlined />} className="!border-current !text-[#722ed1]">
							{epic[1]!.name}
						</Tag>
						<Tag color="#e6fffb" icon={<CopyOutlined />} className="!border-current !text-[#006d75]">
							{feature[1]!.name}
						</Tag>
					</div>
				</div>
				<button
					type="button"
					onClick={() => {
						Promise.resolve(onRemove()).catch(console.error)
					}}
				>
					<CloseOutlined />
				</button>
			</div>
		</div>
	)
}

export default Story
