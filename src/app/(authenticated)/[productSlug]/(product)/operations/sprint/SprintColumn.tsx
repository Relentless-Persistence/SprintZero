import {Card} from "antd"
import {sortBy} from "lodash"

import type {QuerySnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {StoryMapItem} from "~/types/db/Products/StoryMapItems"
import type {Version} from "~/types/db/Products/Versions"

import Story from "./Story"
import {useAppContext} from "~/app/(authenticated)/[productSlug]/AppContext"
import {AllVersions, getStories} from "~/utils/storyMap"

export type SprintColumnProps = {
	columnName: string
	title: string
	storyMapItems: QuerySnapshot<StoryMapItem>
	versions: QuerySnapshot<Version>
	currentVersionId: string | typeof AllVersions
	myStoriesOnly: boolean
}

const SprintColumn: FC<SprintColumnProps> = ({
	columnName,
	title,
	storyMapItems,
	versions,
	currentVersionId,
	myStoriesOnly,
}) => {
	const {user} = useAppContext()
	const stories = sortBy(
		getStories(storyMapItems)
			.filter((story) => story.data().sprintColumn === columnName)
			.filter((story) => (currentVersionId === AllVersions ? true : story.data().versionId === currentVersionId))
			.filter((story) => myStoriesOnly && story.data().peopleIds.includes(user.id)),
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
					<Story key={story.id} storyMapItems={storyMapItems} versions={versions} storyId={story.id} />
				))}
			</div>
		</Card>
	)
}

export default SprintColumn
