"use client"

import {PlusOutlined} from "@ant-design/icons"
import {useQueries} from "@tanstack/react-query"
import {Avatar, Breadcrumb, Button, Card, Empty, FloatButton, Switch, Tabs, Tag} from "antd"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import {Timestamp, addDoc, collection, doc, getDoc, query, updateDoc, where} from "firebase/firestore"
import {useState} from "react"
import {useCollection} from "react-firebase-hooks/firestore"
import Masonry from "react-masonry-css"

import type {FC} from "react"
import type {Id} from "~/types"
import type {RetrospectiveItem} from "~/types/db/Products/RetrospectiveItems"

import RetrospectiveDrawer from "./RetrospectiveDrawer"
import {RetrospectiveItemConverter, retrospectiveTabs} from "~/types/db/Products/RetrospectiveItems"
import {UserConverter} from "~/types/db/Users"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"
import {useUser} from "~/utils/useUser"

dayjs.extend(relativeTime)

const RetrospectiveClientPage: FC = () => {
	const user = useUser()

	const activeProductId = useActiveProductId()
	const [retrospectiveItems, loading] = useCollection(
		query(collection(db, `RetrospectiveItems`), where(`productId`, `==`, activeProductId)).withConverter(
			RetrospectiveItemConverter,
		),
	)

	const [currentTab, setCurrentTab] = useState<`enjoyable` | `puzzling` | `frustrating`>(`enjoyable`)
	const [activeItemId, setActiveItemId] = useState<Id | `new` | undefined>(undefined)
	const [includeArchived, setIncludeArchived] = useState(false)
	const activeItem = retrospectiveItems?.docs.find((item) => item.id === activeItemId)

	const usersData = useQueries({
		queries: retrospectiveItems
			? retrospectiveItems.docs.map((item) => ({
					queryKey: [`user`, item.data().userId],
					queryFn: async () => await getDoc(doc(db, `Users`, item.data().userId).withConverter(UserConverter)),
			  }))
			: [],
	})

	return (
		<div className="flex h-full items-start justify-between">
			<div className="relative flex h-full w-full flex-col gap-6 px-12 py-8">
				<div className="flex flex-col gap-2">
					<div className="flex items-center justify-between">
						<Breadcrumb>
							<Breadcrumb.Item>Tactics</Breadcrumb.Item>
							<Breadcrumb.Item>Retrospective</Breadcrumb.Item>
							<Breadcrumb.Item>{retrospectiveTabs.find(([id]) => id === currentTab)![1]}</Breadcrumb.Item>
						</Breadcrumb>

						<div className="flex items-center gap-2">
							<p className="text-sm">Include archived items</p>
							<Switch checked={includeArchived} onChange={(checked) => setIncludeArchived(checked)} />
						</div>
					</div>
					<p>{tabDescriptions[currentTab]}</p>
				</div>

				{retrospectiveItems && retrospectiveItems.docs.length > 0 ? (
					<Masonry
						breakpointCols={{default: 4, 1700: 3, 1300: 2, 1000: 1}}
						className="flex gap-8"
						columnClassName="flex flex-col gap-8"
					>
						{retrospectiveItems.docs
							.filter((item) => item.data().type === currentTab)
							.filter((item) => includeArchived || !item.data().archived)
							.map((item) => (
								<Card
									key={item.id}
									type="inner"
									title={(() => {
										const user = usersData.find((user) => user.data?.id === item.data().userId)?.data

										return (
											<div className="my-4 flex items-center gap-4">
												<Avatar src={user?.data()?.avatar} shape="square" size="large" />
												<div className="flex flex-col">
													<p>{user?.data()?.name}</p>
													<p className="font-normal text-textTertiary">
														Created {dayjs(item.data().createdAt.toMillis()).fromNow()}
													</p>
												</div>
											</div>
										)
									})()}
									extra={
										item.data().userId === user?.id ? (
											<Button size="small" onClick={() => setActiveItemId(item.id)}>
												Edit
											</Button>
										) : undefined
									}
								>
									<div className="flex flex-col items-start gap-2">
										<Tag>
											{item.data().proposedActions.length} proposed action
											{item.data().proposedActions.length === 1 ? `` : `s`}
										</Tag>
										<p>{item.data().description}</p>
									</div>
								</Card>
							))}
					</Masonry>
				) : (
					<div className="grid h-full place-items-center">
						<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
					</div>
				)}

				<FloatButton
					icon={<PlusOutlined />}
					tooltip="Add Item"
					onClick={() => setActiveItemId(`new`)}
					className="absolute bottom-8 right-12 text-primary"
				/>
			</div>

			<Tabs
				tabPosition="right"
				activeKey={currentTab}
				onChange={(key: `enjoyable` | `puzzling` | `frustrating`) => setCurrentTab(key)}
				className="h-full"
				items={retrospectiveTabs.map(([key, label]) => ({key, label}))}
			/>

			{!loading && activeItemId && (
				<RetrospectiveDrawer
					activeItemId={activeItemId}
					initialValues={
						(activeItemId === `new` ? undefined : activeItem?.data()) ?? {
							description: ``,
							proposedActions: [],
							title: ``,
							type: currentTab,
						}
					}
					onCancel={() => setActiveItemId(undefined)}
					onArchive={async () => {
						setActiveItemId(undefined)
						await updateDoc(activeItem!.ref, {archived: true})
					}}
					onCommit={async (values) => {
						const data: RetrospectiveItem = {
							...values,
							archived: false,
							createdAt: Timestamp.now(),
							productId: activeProductId,
							userId: user!.id,
						}
						if (activeItemId === `new`) {
							await addDoc(collection(db, `RetrospectiveItems`).withConverter(RetrospectiveItemConverter), data)
						} else {
							await updateDoc(activeItem!.ref, data)
						}
						setActiveItemId(undefined)
					}}
				/>
			)}
		</div>
	)
}

export default RetrospectiveClientPage

const tabDescriptions = {
	enjoyable: `Which aspects have team members had fun with?`,
	puzzling: `Which aspects have team members not quite understood?`,
	frustrating: `Which aspects have team members not found valuable?`,
}
