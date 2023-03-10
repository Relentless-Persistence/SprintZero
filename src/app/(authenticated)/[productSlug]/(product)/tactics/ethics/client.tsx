"use client"

import {CloseOutlined, DislikeOutlined, FilterOutlined, LikeOutlined} from "@ant-design/icons"
import {Alert, Breadcrumb, Button, Card, Dropdown, Tag} from "antd"
import {collection} from "firebase/firestore"
import {useState} from "react"
import {useCollection} from "react-firebase-hooks/firestore"

import type {FC} from "react"

import Story from "./Story"
import {useAppContext} from "~/app/(authenticated)/[productSlug]/AppContext"
import {StoryMapItemConverter} from "~/types/db/Products/StoryMapItems"
import {getStories} from "~/utils/storyMap"

const EthicsClientPage: FC = () => {
	const {product} = useAppContext()
	const [storyMapItems] = useCollection(collection(product.ref, `StoryMapItems`).withConverter(StoryMapItemConverter))
	const stories = storyMapItems ? getStories(storyMapItems) : []

	const [filter, setFilter] = useState<`approved` | `rejected` | `all`>(`all`)

	return (
		<>
			{stories.filter((story) => story.data().ethicsColumn !== null).length === 0 && (
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
						extra={<p>{stories.filter((story) => story.data().ethicsColumn === `underReview`).length}</p>}
					>
						<div className="flex flex-col gap-4">
							{storyMapItems &&
								stories
									.filter((story) => story.data().ethicsColumn === `underReview`)
									.map((story) => <Story key={story.id} storyMapItems={storyMapItems} storyId={story.id} />)}
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
							{storyMapItems &&
								stories
									.filter((story) => story.data().ethicsColumn === `adjudicated`)
									.filter((story) => filter === `all` || (filter === `approved` && story.data().ethicsApproved))
									.map((story) => <Story key={story.id} storyMapItems={storyMapItems} storyId={story.id} />)}
						</div>
					</Card>
				</div>
			</div>
		</>
	)
}

export default EthicsClientPage
