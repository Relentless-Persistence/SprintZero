"use client"

import {Breadcrumb, Card} from "antd5"
import {useAtomValue} from "jotai"

import type {FC} from "react"

import Story from "./Story"
import {activeProductAtom} from "~/utils/atoms"

const EthicsPage: FC = () => {
	const activeProduct = useAtomValue(activeProductAtom)
	const stories = activeProduct?.storyMapState.stories
	const features = activeProduct?.storyMapState.features

	return (
		<>
			{stories?.filter((story) => story.ethicsColumn !== null).length === 0 && (
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
							{features &&
								stories
									?.filter((story) => story.ethicsColumn === `identified`)
									.map((story) => (
										<Story
											key={story.id}
											story={story}
											featureName={features.find((feature) => feature.storyIds.includes(story.id))!.name}
										/>
									))}
						</div>
					</Card>
					<Card title="Under Review">
						<div className="space-y-4">
							{features &&
								stories
									?.filter((story) => story.ethicsColumn === `under-review`)
									.map((story) => (
										<Story
											key={story.id}
											story={story}
											featureName={features.find((feature) => feature.storyIds.includes(story.id))!.name}
										/>
									))}
						</div>
					</Card>
					<Card title="Adjudicated">
						<div className="space-y-4">
							{features &&
								stories
									?.filter((story) => story.ethicsColumn === `adjudicated`)
									.map((story) => (
										<Story
											key={story.id}
											story={story}
											featureName={features.find((feature) => feature.storyIds.includes(story.id))!.name}
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
