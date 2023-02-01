"use client"

import {Breadcrumb, Card} from "antd5"
import {doc, onSnapshot} from "firebase9/firestore"
import {useEffect, useState} from "react"

import type {FC} from "react"
import type {StoryMapState} from "~/types/db/StoryMapStates"

import Story from "./Story"
import {db} from "~/utils/firebase"
import {StoryMapStates, StoryMapStateSchema} from "~/types/db/StoryMapStates"

const SprintPage: FC = () => {
	const [storyMapState, setStoryMapState] = useState<StoryMapState>()
	useEffect(
		() =>
			onSnapshot(doc(db, StoryMapStates._), (doc) => {
				const data = StoryMapStateSchema.parse({id: doc.id, ...doc.data()})
				setStoryMapState(data)
			}),
		[],
	)

	return (
		<div className="flex h-full flex-col gap-6">
			<div className="mx-12 mt-8">
				<Breadcrumb>
					<Breadcrumb.Item>Operations</Breadcrumb.Item>
					<Breadcrumb.Item>Sprint</Breadcrumb.Item>
				</Breadcrumb>
			</div>
			<div className="flex w-full grow overflow-x-auto pl-12 pb-8">
				<div className="grid h-full grid-cols-[repeat(12,14rem)] gap-4">
					<Card type="inner" title="Product Backlog">
						{storyMapState?.stories
							.filter((story) => story.sprintColumn === `productBacklog`)
							.map((story) => (
								<Story key={story.id} storyMapState={storyMapState} setStoryMapState={setStoryMapState} story={story} />
							))}
					</Card>
					<Card type="inner" title="Design Sprint Backlog">
						{storyMapState?.stories
							.filter((story) => story.sprintColumn === `designBacklog`)
							.map((story) => (
								<Story key={story.id} storyMapState={storyMapState} setStoryMapState={setStoryMapState} story={story} />
							))}
					</Card>
					<Card type="inner" title="Designing">
						{storyMapState?.stories
							.filter((story) => story.sprintColumn === `designing`)
							.map((story) => (
								<Story key={story.id} storyMapState={storyMapState} setStoryMapState={setStoryMapState} story={story} />
							))}
					</Card>
					<Card type="inner" title="Critique">
						{storyMapState?.stories
							.filter((story) => story.sprintColumn === `critique`)
							.map((story) => (
								<Story key={story.id} storyMapState={storyMapState} setStoryMapState={setStoryMapState} story={story} />
							))}
					</Card>
					<Card type="inner" title="Design Done / Dev Ready">
						{storyMapState?.stories
							.filter((story) => story.sprintColumn === `devReady`)
							.map((story) => (
								<Story key={story.id} storyMapState={storyMapState} setStoryMapState={setStoryMapState} story={story} />
							))}
					</Card>
					<Card type="inner" title="Dev Sprint Backlog">
						{storyMapState?.stories
							.filter((story) => story.sprintColumn === `devBacklog`)
							.map((story) => (
								<Story key={story.id} storyMapState={storyMapState} setStoryMapState={setStoryMapState} story={story} />
							))}
					</Card>
					<Card type="inner" title="Developing">
						{storyMapState?.stories
							.filter((story) => story.sprintColumn === `developing`)
							.map((story) => (
								<Story key={story.id} storyMapState={storyMapState} setStoryMapState={setStoryMapState} story={story} />
							))}
					</Card>
					<Card type="inner" title="Design Review">
						{storyMapState?.stories
							.filter((story) => story.sprintColumn === `designReview`)
							.map((story) => (
								<Story key={story.id} storyMapState={storyMapState} setStoryMapState={setStoryMapState} story={story} />
							))}
					</Card>
					<Card type="inner" title="Peer Code Review">
						{storyMapState?.stories
							.filter((story) => story.sprintColumn === `codeReview`)
							.map((story) => (
								<Story key={story.id} storyMapState={storyMapState} setStoryMapState={setStoryMapState} story={story} />
							))}
					</Card>
					<Card type="inner" title="QA">
						{storyMapState?.stories
							.filter((story) => story.sprintColumn === `qa`)
							.map((story) => (
								<Story key={story.id} storyMapState={storyMapState} setStoryMapState={setStoryMapState} story={story} />
							))}
					</Card>
					<Card type="inner" title="Production Queue">
						{storyMapState?.stories
							.filter((story) => story.sprintColumn === `productionQueue`)
							.map((story) => (
								<Story key={story.id} storyMapState={storyMapState} setStoryMapState={setStoryMapState} story={story} />
							))}
					</Card>
					<Card type="inner" title="Shipped">
						{storyMapState?.stories
							.filter((story) => story.sprintColumn === `shipped`)
							.map((story) => (
								<Story key={story.id} storyMapState={storyMapState} setStoryMapState={setStoryMapState} story={story} />
							))}
					</Card>
				</div>

				{/* Spacer because padding doesn't work in the overflow */}
				<div className="shrink-0 basis-12" />
			</div>
		</div>
	)
}

export default SprintPage
