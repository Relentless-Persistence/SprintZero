"use client"

import {Breadcrumb, Card} from "antd"
import {doc} from "firebase/firestore"
import {useDocument} from "react-firebase-hooks/firestore"

import type {FC} from "react"

import Story from "./Story"
import {ProductConverter} from "~/types/db/Products"
import {StoryMapStateConverter} from "~/types/db/StoryMapStates"
import {db} from "~/utils/firebase"
import {getStories} from "~/utils/storyMap"
import {useActiveProductId} from "~/utils/useActiveProductId"

const EthicsPage: FC = () => {
	const activeProductId = useActiveProductId()
	const [activeProduct] = useDocument(doc(db, `Products`, activeProductId).withConverter(ProductConverter))
	const [storyMapState] = useDocument(
		activeProduct?.exists()
			? doc(db, `StoryMapStates`, activeProduct.data().storyMapStateId).withConverter(StoryMapStateConverter)
			: undefined,
	)
	const stories = storyMapState?.exists() ? getStories(storyMapState.data()) : []

	return (
		<>
			{stories.filter((story) => story.ethicsColumn !== null).length === 0 && (
				<div className="absolute z-10 h-full w-full bg-black/20">
					<p className="absolute bottom-12 right-12 border border-[#ffa39e] bg-[#fff1f0] px-4 py-2">
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
						<div className="flex flex-col gap-4">
							{activeProduct?.exists() &&
								storyMapState?.exists() &&
								stories
									.filter((story) => story.ethicsColumn === `identified`)
									.map((story) => (
										<Story
											key={story.id}
											activeProduct={activeProduct}
											storyMapState={storyMapState}
											storyId={story.id}
										/>
									))}
						</div>
					</Card>
					<Card title="Under Review">
						<div className="flex flex-col gap-4">
							{activeProduct?.exists() &&
								storyMapState?.exists() &&
								stories
									.filter((story) => story.ethicsColumn === `underReview`)
									.map((story) => (
										<Story
											key={story.id}
											activeProduct={activeProduct}
											storyMapState={storyMapState}
											storyId={story.id}
										/>
									))}
						</div>
					</Card>
					<Card title="Adjudicated">
						<div className="flex flex-col gap-4">
							{activeProduct?.exists() &&
								storyMapState?.exists() &&
								stories
									.filter((story) => story.ethicsColumn === `adjudicated`)
									.map((story) => (
										<Story
											key={story.id}
											activeProduct={activeProduct}
											storyMapState={storyMapState}
											storyId={story.id}
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
