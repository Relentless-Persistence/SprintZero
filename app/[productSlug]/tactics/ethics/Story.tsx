import {DislikeFilled, LikeFilled} from "@ant-design/icons"
import {useState} from "react"

import type {FC} from "react"

import StoryDrawer from "./StoryDrawer"
import {Story} from "~/types/db/Products"

export type StoryProps = {
	story: Story
	featureName: string
}

const Story: FC<StoryProps> = ({story, featureName}) => {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)

	return (
		<>
			<button
				type="button"
				onClick={() => void setIsDrawerOpen(true)}
				className="flex w-full items-center justify-between gap-2 border border-laurel bg-[#fafafa] px-4 py-3 text-left"
			>
				<div className="space-y-1">
					<p className="font-medium">{story.name}</p>
					<p className="inline-block border border-green-t600 bg-green-t1100 px-1 py-0.5 text-xs text-green-s800">
						{featureName}
					</p>
				</div>
				{story.ethicsApproved === true && <LikeFilled className="text-xl text-[#54A31C]" />}
				{story.ethicsApproved === false && <DislikeFilled className="text-xl text-[#FA541C]" />}
			</button>

			<StoryDrawer story={story} isOpen={isDrawerOpen} onClose={() => void setIsDrawerOpen(false)} />
		</>
	)
}

export default Story
