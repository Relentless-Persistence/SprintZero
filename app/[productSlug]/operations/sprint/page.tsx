"use client"

import {Breadcrumb, Card} from "antd5"
import {useAtomValue} from "jotai"

import type {FC} from "react"

import Story from "./Story"
import {activeProductAtom} from "~/utils/atoms"

const SprintPage: FC = () => {
	const activeProduct = useAtomValue(activeProductAtom)

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
						{activeProduct?.storyMapState.stories
							.filter((story) => story.sprintColumn === `productBacklog`)
							.map((story) => (
								<Story key={story.id} story={story} />
							))}
					</Card>
					<Card type="inner" title="Design Sprint Backlog">
						{activeProduct?.storyMapState.stories
							.filter((story) => story.sprintColumn === `designBacklog`)
							.map((story) => (
								<Story key={story.id} story={story} />
							))}
					</Card>
					<Card type="inner" title="Designing">
						{activeProduct?.storyMapState.stories
							.filter((story) => story.sprintColumn === `designing`)
							.map((story) => (
								<Story key={story.id} story={story} />
							))}
					</Card>
					<Card type="inner" title="Critique">
						{activeProduct?.storyMapState.stories
							.filter((story) => story.sprintColumn === `critique`)
							.map((story) => (
								<Story key={story.id} story={story} />
							))}
					</Card>
					<Card type="inner" title="Design Done / Dev Ready">
						{activeProduct?.storyMapState.stories
							.filter((story) => story.sprintColumn === `devReady`)
							.map((story) => (
								<Story key={story.id} story={story} />
							))}
					</Card>
					<Card type="inner" title="Dev Sprint Backlog">
						{activeProduct?.storyMapState.stories
							.filter((story) => story.sprintColumn === `devBacklog`)
							.map((story) => (
								<Story key={story.id} story={story} />
							))}
					</Card>
					<Card type="inner" title="Developing">
						{activeProduct?.storyMapState.stories
							.filter((story) => story.sprintColumn === `developing`)
							.map((story) => (
								<Story key={story.id} story={story} />
							))}
					</Card>
					<Card type="inner" title="Design Review">
						{activeProduct?.storyMapState.stories
							.filter((story) => story.sprintColumn === `designReview`)
							.map((story) => (
								<Story key={story.id} story={story} />
							))}
					</Card>
					<Card type="inner" title="Peer Code Review">
						{activeProduct?.storyMapState.stories
							.filter((story) => story.sprintColumn === `codeReview`)
							.map((story) => (
								<Story key={story.id} story={story} />
							))}
					</Card>
					<Card type="inner" title="QA">
						{activeProduct?.storyMapState.stories
							.filter((story) => story.sprintColumn === `qa`)
							.map((story) => (
								<Story key={story.id} story={story} />
							))}
					</Card>
					<Card type="inner" title="Production Queue">
						{activeProduct?.storyMapState.stories
							.filter((story) => story.sprintColumn === `productionQueue`)
							.map((story) => (
								<Story key={story.id} story={story} />
							))}
					</Card>
					<Card type="inner" title="Shipped">
						{activeProduct?.storyMapState.stories
							.filter((story) => story.sprintColumn === `shipped`)
							.map((story) => (
								<Story key={story.id} story={story} />
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
