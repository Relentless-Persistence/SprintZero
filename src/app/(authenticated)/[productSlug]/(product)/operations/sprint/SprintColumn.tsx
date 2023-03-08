import {Card} from "antd"
import {sortBy} from "lodash"

import type {QueryDocumentSnapshot, QuerySnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {StoryMapItem} from "~/types/db/Products/StoryMapItems"
import type {Version} from "~/types/db/Products/Versions"

import Story from "./Story"
import {AllVersions, getStories} from "~/utils/storyMap"
import {useUser} from "~/utils/useUser"

export type SprintColumnProps = {
	columnName: string
	title: string
	storyMapItems: QuerySnapshot<StoryMapItem>
	allVersions: QuerySnapshot<Version>
	currentVersionId: string | typeof AllVersions
	myStoriesOnly: boolean
}

const SprintColumn: FC<SprintColumnProps> = ({
	columnName,
	title,
	storyMapItems,
	allVersions,
	currentVersionId,
	myStoriesOnly,
}) => {
	const user = useUser()
	const stories = sortBy(
		getStories(storyMapItems)
			.filter((story) => story.data().sprintColumn === columnName)
			.filter((story) => (currentVersionId === AllVersions ? true : story.data().versionId === currentVersionId))
			.filter((story) => (myStoriesOnly && user ? story.data().peopleIds.includes(user.id) : true)),
		[(el) => el.data().updatedAt.toMillis()],
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
					<Story key={story.id} storyMapState={storyMapItems} allVersions={allVersions} storyId={story.id} />
				))}
			</div>
		</Card>
	)
}

export default SprintColumn
