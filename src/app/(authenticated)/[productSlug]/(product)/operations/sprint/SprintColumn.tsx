import {Card} from "antd"
import {sortBy} from "lodash"

import type {QueryDocumentSnapshot, QuerySnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {Id} from "~/types"
import type {StoryMapState} from "~/types/db/StoryMapStates"
import type {Version} from "~/types/db/Versions"

import Story from "./Story"
import {getStories} from "~/utils/storyMap"
import {useUser} from "~/utils/useUser"

export type SprintColumnProps = {
	columnName: string
	title: string
	storyMapState: QueryDocumentSnapshot<StoryMapState>
	allVersions: QuerySnapshot<Version>
	currentVersionId: Id | `__ALL_VERSIONS__`
	myStoriesOnly: boolean
}

const SprintColumn: FC<SprintColumnProps> = ({
	columnName,
	title,
	storyMapState,
	allVersions,
	currentVersionId,
	myStoriesOnly,
}) => {
	const user = useUser()
	const stories = sortBy(
		getStories(storyMapState.data().items)
			.filter((story) => story.sprintColumn === columnName)
			.filter((story) => (currentVersionId === `__ALL_VERSIONS__` ? true : story.versionId === currentVersionId))
			.filter((story) => (myStoriesOnly && user ? story.peopleIds.includes(user.id as Id) : true)),
		[(el) => el.updatedAt.toMillis()],
	)

	return (
		<Card
			title={title}
			extra={stories.length}
			id={columnName}
			className="sprint-column grid min-h-0 grid-rows-[auto_1fr] [&>.ant-card-body]:overflow-auto"
		>
			<div className="flex flex-col gap-4">
				{stories.map((story) => (
					<Story key={story.id} storyMapState={storyMapState} allVersions={allVersions} storyId={story.id} />
				))}
			</div>
		</Card>
	)
}

export default SprintColumn
