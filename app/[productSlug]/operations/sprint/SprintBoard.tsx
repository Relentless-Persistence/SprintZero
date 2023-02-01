import {Card} from "antd"
import {doc} from "firebase/firestore"
import {useDocumentData} from "react-firebase-hooks/firestore"

import type {FC} from "react"
import type {WithDocumentData} from "~/types"
import type {Product} from "~/types/db/Products"

import Story from "./Story"
import {StoryMapStateConverter, StoryMapStates} from "~/types/db/StoryMapStates"
import {db} from "~/utils/firebase"

export type SprintBoardProps = {
	activeProduct: WithDocumentData<Product>
}

const SprintBoard: FC<SprintBoardProps> = ({activeProduct}) => {
	const [storyMapState] = useDocumentData(
		doc(db, StoryMapStates._, activeProduct.storyMapStateId).withConverter(StoryMapStateConverter),
	)

	return (
		<div className="grid h-full grid-cols-[repeat(12,14rem)] gap-4">
			<Card type="inner" title="Product Backlog">
				{storyMapState?.stories
					.filter((story) => story.sprintColumn === `productBacklog`)
					.map((story) => (
						<Story key={story.id} activeProduct={activeProduct} storyMapState={storyMapState} storyId={story.id} />
					))}
			</Card>
			<Card type="inner" title="Design Sprint Backlog">
				{storyMapState?.stories
					.filter((story) => story.sprintColumn === `designBacklog`)
					.map((story) => (
						<Story key={story.id} activeProduct={activeProduct} storyMapState={storyMapState} storyId={story.id} />
					))}
			</Card>
			<Card type="inner" title="Designing">
				{storyMapState?.stories
					.filter((story) => story.sprintColumn === `designing`)
					.map((story) => (
						<Story key={story.id} activeProduct={activeProduct} storyMapState={storyMapState} storyId={story.id} />
					))}
			</Card>
			<Card type="inner" title="Critique">
				{storyMapState?.stories
					.filter((story) => story.sprintColumn === `critique`)
					.map((story) => (
						<Story key={story.id} activeProduct={activeProduct} storyMapState={storyMapState} storyId={story.id} />
					))}
			</Card>
			<Card type="inner" title="Design Done / Dev Ready">
				{storyMapState?.stories
					.filter((story) => story.sprintColumn === `devReady`)
					.map((story) => (
						<Story key={story.id} activeProduct={activeProduct} storyMapState={storyMapState} storyId={story.id} />
					))}
			</Card>
			<Card type="inner" title="Dev Sprint Backlog">
				{storyMapState?.stories
					.filter((story) => story.sprintColumn === `devBacklog`)
					.map((story) => (
						<Story key={story.id} activeProduct={activeProduct} storyMapState={storyMapState} storyId={story.id} />
					))}
			</Card>
			<Card type="inner" title="Developing">
				{storyMapState?.stories
					.filter((story) => story.sprintColumn === `developing`)
					.map((story) => (
						<Story key={story.id} activeProduct={activeProduct} storyMapState={storyMapState} storyId={story.id} />
					))}
			</Card>
			<Card type="inner" title="Design Review">
				{storyMapState?.stories
					.filter((story) => story.sprintColumn === `designReview`)
					.map((story) => (
						<Story key={story.id} activeProduct={activeProduct} storyMapState={storyMapState} storyId={story.id} />
					))}
			</Card>
			<Card type="inner" title="Peer Code Review">
				{storyMapState?.stories
					.filter((story) => story.sprintColumn === `codeReview`)
					.map((story) => (
						<Story key={story.id} activeProduct={activeProduct} storyMapState={storyMapState} storyId={story.id} />
					))}
			</Card>
			<Card type="inner" title="QA">
				{storyMapState?.stories
					.filter((story) => story.sprintColumn === `qa`)
					.map((story) => (
						<Story key={story.id} activeProduct={activeProduct} storyMapState={storyMapState} storyId={story.id} />
					))}
			</Card>
			<Card type="inner" title="Production Queue">
				{storyMapState?.stories
					.filter((story) => story.sprintColumn === `productionQueue`)
					.map((story) => (
						<Story key={story.id} activeProduct={activeProduct} storyMapState={storyMapState} storyId={story.id} />
					))}
			</Card>
			<Card type="inner" title="Shipped">
				{storyMapState?.stories
					.filter((story) => story.sprintColumn === `shipped`)
					.map((story) => (
						<Story key={story.id} activeProduct={activeProduct} storyMapState={storyMapState} storyId={story.id} />
					))}
			</Card>
		</div>
	)
}

export default SprintBoard
