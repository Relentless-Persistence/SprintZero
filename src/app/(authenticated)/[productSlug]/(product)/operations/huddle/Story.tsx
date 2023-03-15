import {CloseOutlined, CopyOutlined, ReadOutlined} from "@ant-design/icons"
import {Tag} from "antd"

import type {QuerySnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {Promisable} from "type-fest"
import type {StoryMapItem} from "~/types/db/Products/StoryMapItems"
import type {Version} from "~/types/db/Products/Versions"

export type StoryProps = {
	storyMapItems: QuerySnapshot<StoryMapItem>
	versions: QuerySnapshot<Version>
	storyId: string
	onRemove: (() => Promisable<void>) | undefined
}

const Story: FC<StoryProps> = ({storyMapItems, versions, storyId, onRemove}) => {
	const story = storyMapItems.docs.find((item) => item.id === storyId)!
	const feature = storyMapItems.docs.find((item) => item.id === story.data().parentId)!
	const epic = storyMapItems.docs.find((item) => item.id === feature.data().parentId)!

	return (
		<div className="flex items-center overflow-hidden rounded-md border border-border">
			<div className="flex flex-col self-stretch border-r border-border bg-[#f1f2f5] p-2">
				<p className="min-h-0 flex-1 truncate text-center text-xs leading-none [writing-mode:vertical-lr]">
					{versions.docs.find((version) => version.id === story.data().versionId)?.data().name}
				</p>
			</div>
			<div className="flex grow items-center justify-between gap-2 px-4 py-2">
				<div className="flex flex-col gap-1">
					<p className="-mt-0.5">{story.data().name}</p>
					<div className="flex gap-2">
						<Tag color="#f9f0ff" icon={<ReadOutlined />} className="!border-current !text-[#722ed1]">
							{epic.data().name}
						</Tag>
						<Tag color="#e6fffb" icon={<CopyOutlined />} className="!border-current !text-[#006d75]">
							{feature.data().name}
						</Tag>
					</div>
				</div>
				{onRemove && (
					<button
						type="button"
						onClick={() => {
							Promise.resolve(onRemove()).catch(console.error)
						}}
					>
						<CloseOutlined />
					</button>
				)}
			</div>
		</div>
	)
}

export default Story
