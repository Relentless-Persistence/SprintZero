"use client"

import {CloseOutlined, DislikeOutlined, FilterOutlined, LikeOutlined} from "@ant-design/icons"
import {Alert, Breadcrumb, Button, Card, Dropdown, Tag} from "antd"
import {collection, doc, query, where} from "firebase/firestore"
import {useState} from "react"
import {useCollection, useDocument} from "react-firebase-hooks/firestore"

import type {FC} from "react"

import Story from "./Story"
import {ProductConverter} from "~/types/db/Products"
import {StoryMapStateConverter} from "~/types/db/StoryMapStates"
import {db} from "~/utils/firebase"
import {getStories} from "~/utils/storyMap"
import {useActiveProductId} from "~/utils/useActiveProductId"

const EthicsClientPage: FC = () => {
	const activeProductId = useActiveProductId()
	const [activeProduct] = useDocument(doc(db, `Products`, activeProductId).withConverter(ProductConverter))
	const [storyMapStates] = useCollection(
		query(collection(db, `StoryMapStates`), where(`productId`, `==`, activeProductId)).withConverter(
			StoryMapStateConverter,
		),
	)
	const storyMapState = storyMapStates?.docs[0]
	const stories = storyMapState ? getStories(storyMapState.data().items) : []

	const [filter, setFilter] = useState<`approved` | `rejected` | `all`>(`all`)

	return (
		<>
			{stories.filter((story) => story.ethicsColumn !== null).length === 0 && (
				<Alert
					type="error"
					showIcon
					message="No elements present; flag a user story to populate"
					className="absolute bottom-8 right-12 z-10"
				/>
			)}

			<div className="flex h-full flex-col gap-6 px-12 py-8">
				<Breadcrumb>
					<Breadcrumb.Item>Tactics</Breadcrumb.Item>
					<Breadcrumb.Item>Ethics</Breadcrumb.Item>
				</Breadcrumb>

				<div className="grid w-full grow grid-cols-2 gap-6">
					<Card
						title="Under Review"
						extra={<p>{stories.filter((story) => story.ethicsColumn === `underReview`).length}</p>}
					>
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
					<Card
						title="Adjudicated"
						extra={
							<div className="flex gap-1">
								{filter === `approved` && (
									<button type="button" onClick={() => setFilter(`all`)}>
										<Tag icon={<LikeOutlined />} color="green">
											Approved <CloseOutlined className="ml-0.5" />
										</Tag>
									</button>
								)}
								{filter === `rejected` && (
									<button type="button" onClick={() => setFilter(`all`)}>
										<Tag icon={<DislikeOutlined />} color="red">
											Rejected <CloseOutlined className="ml-0.5" />
										</Tag>
									</button>
								)}
								<Dropdown
									trigger={[`click`]}
									menu={{
										items: [
											{label: `Approved`, key: `approved`, onClick: () => setFilter(`approved`)},
											{label: `Rejected`, key: `rejected`, onClick: () => setFilter(`rejected`)},
											{label: `All`, key: `all`, onClick: () => setFilter(`all`)},
										],
										selectable: true,
										defaultSelectedKeys: [`all`],
									}}
								>
									<Button size="small" icon={<FilterOutlined />} className="flex items-center">
										Filter
									</Button>
								</Dropdown>
							</div>
						}
					>
						<div className="flex flex-col gap-4">
							{activeProduct?.exists() &&
								storyMapState?.exists() &&
								stories
									.filter((story) => story.ethicsColumn === `adjudicated`)
									.filter((story) => filter === `all` || (filter === `approved` && story.ethicsApproved))
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

export default EthicsClientPage
