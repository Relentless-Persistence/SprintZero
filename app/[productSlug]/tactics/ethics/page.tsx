"use client"

import {Breadcrumb, Card} from "antd5"
import {doc, onSnapshot} from "firebase9/firestore"
import {useEffect, useState} from "react"

import type {FC} from "react"
import type {StoryMapState} from "~/types/db/StoryMapStates"

import Story from "./Story"
import {db} from "~/config/firebase"
import {StoryMapStateSchema, StoryMapStates} from "~/types/db/StoryMapStates"

const EthicsPage: FC = () => {
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
		<>
			{storyMapState?.stories.filter((story) => story.ethicsColumn !== null).length === 0 && (
				<div className="absolute z-10 h-full w-full bg-black/20">
					<p className="absolute bottom-12 right-12 border border-[#FFA39E] bg-[#FFF1F0] px-4 py-2">
						No elements present; flag a user story to populate
					</p>
				</div>
			)}

			<div className="flex h-full flex-col gap-6 px-12 py-8">
				<Breadcrumb>
					<Breadcrumb.Item>Tactics</Breadcrumb.Item>
					<Breadcrumb.Item>Ethics</Breadcrumb.Item>
				</Breadcrumb>

				<div className="grid w-full grow grid-cols-3 gap-6">
					<Card title="Identified">
						<div className="space-y-4">
							{storyMapState?.stories
								.filter((story) => story.ethicsColumn === `identified`)
								.map((story) => (
									<Story
										key={story.id}
										storyMapState={storyMapState}
										setStoryMapState={setStoryMapState}
										story={story}
									/>
								))}
						</div>
					</Card>
					<Card title="Under Review">
						<div className="space-y-4">
							{storyMapState?.stories
								.filter((story) => story.ethicsColumn === `underReview`)
								.map((story) => (
									<Story
										key={story.id}
										storyMapState={storyMapState}
										setStoryMapState={setStoryMapState}
										story={story}
									/>
								))}
						</div>
					</Card>
					<Card title="Adjudicated">
						<div className="space-y-4">
							{storyMapState?.stories
								.filter((story) => story.ethicsColumn === `adjudicated`)
								.map((story) => (
									<Story
										key={story.id}
										storyMapState={storyMapState}
										setStoryMapState={setStoryMapState}
										story={story}
									/>
								))}
						</div>
					</Card>
				</div>
			</div>
		</>
	)
}

export default EthicsPage
