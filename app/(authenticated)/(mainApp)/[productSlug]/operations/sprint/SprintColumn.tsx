import {Card} from "antd"
import dayjs from "dayjs"

import type {QueryDocumentSnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {Product} from "~/types/db/Products"
import type {StoryMapState} from "~/types/db/StoryMapStates"

import Story from "./Story"
import {getStories} from "~/utils/storyMap"

export type SprintColumnProps = {
	id: string
	title: string
	sprintStartDate: string
	activeProduct: QueryDocumentSnapshot<Product>
	storyMapState: QueryDocumentSnapshot<StoryMapState>
}

const SprintColumn: FC<SprintColumnProps> = ({id, title, sprintStartDate, activeProduct, storyMapState}) => {
	const stories = getStories(storyMapState.data())

	return (
		<Card type="inner" title={title}>
			<div className="flex flex-col gap-4">
				{stories
					.filter((story) => story.sprintColumn === id)
					.filter(
						(story) =>
							dayjs(story.createdAt?.toDate()).isAfter(sprintStartDate) &&
							dayjs(story.createdAt?.toDate()).isBefore(dayjs(sprintStartDate).add(1, `week`)),
					)
					.map((story) => (
						<Story key={story.id} activeProduct={activeProduct} storyMapState={storyMapState} storyId={story.id} />
					))}
			</div>
		</Card>
	)
}

export default SprintColumn
