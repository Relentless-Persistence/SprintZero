import {Card} from "antd"
import dayjs from "dayjs"

import type {FC} from "react"
import type {WithDocumentData} from "~/types"
import type {Product} from "~/types/db/Products"
import type {StoryMapState} from "~/types/db/StoryMapStates"

import Story from "./Story"

export type SprintColumnProps = {
	id: string
	title: string
	sprintStartDate: string
	activeProduct: WithDocumentData<Product>
	storyMapState: WithDocumentData<StoryMapState>
}

const SprintColumn: FC<SprintColumnProps> = ({id, title, sprintStartDate, activeProduct, storyMapState}) => {
	return (
		<Card type="inner" title={title}>
			<div className="space-y-4">
				{storyMapState.stories
					.filter((story) => story.sprintColumn === id)
					.filter(
						(story) =>
							dayjs(story.createdAt.toDate()).isAfter(sprintStartDate) &&
							dayjs(story.createdAt.toDate()).isBefore(dayjs(sprintStartDate).add(1, `week`)),
					)
					.map((story) => (
						<Story key={story.id} activeProduct={activeProduct} storyMapState={storyMapState} storyId={story.id} />
					))}
			</div>
		</Card>
	)
}

export default SprintColumn
