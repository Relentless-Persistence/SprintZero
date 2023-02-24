import {Card} from "antd"
import dayjs from "dayjs"

import type {QueryDocumentSnapshot, QuerySnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {StoryMapState} from "~/types/db/StoryMapStates"
import type {Version} from "~/types/db/Versions"

import Story from "./Story"
import {getStories} from "~/utils/storyMap"

export type SprintColumnProps = {
	id: string
	title: string
	sprintStartDate: string
	storyMapState: QueryDocumentSnapshot<StoryMapState>
	allVersions: QuerySnapshot<Version>
}

const SprintColumn: FC<SprintColumnProps> = ({id, title, sprintStartDate, storyMapState, allVersions}) => {
	const stories = getStories(storyMapState.data())

	return (
		<Card type="inner" title={title}>
			<div className="flex flex-col gap-4">
				{stories
					.filter((story) => story.sprintColumn === id)
					.filter(
						(story) =>
							dayjs(story.createdAt.toDate()).isAfter(sprintStartDate) &&
							dayjs(story.createdAt.toDate()).isBefore(dayjs(sprintStartDate).add(1, `week`)),
					)
					.map((story) => (
						<Story key={story.id} storyMapState={storyMapState} allVersions={allVersions} storyId={story.id} />
					))}
			</div>
		</Card>
	)
}

export default SprintColumn
