"use client"

import {PlusOutlined} from "@ant-design/icons"
import {useQueries} from "@tanstack/react-query"
import {Avatar, Breadcrumb, Button, Card, Empty, FloatButton, Switch, Tabs, Tag} from "antd"
import {addDoc, collection, doc, getDoc, query, setDoc, where} from "firebase/firestore"
import {useState} from "react"
import {useCollection} from "react-firebase-hooks/firestore"
import Masonry from "react-masonry-css"

import type {FC} from "react"
import type {Id} from "~/types"
import type {RetrospectiveItem} from "~/types/db/RetrospectiveItems"

import RetrospectiveDrawer from "./RetrospectiveDrawer"
import {RetrospectiveItemConverter, retrospectiveTabs} from "~/types/db/RetrospectiveItems"
import {UserConverter} from "~/types/db/Users"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"
import {useUser} from "~/utils/useUser"

const RetrospectiveClientPage: FC = () => {
	const user = useUser()

	const activeProductId = useActiveProductId()
	const [retrospectiveItems, loading] = useCollection(
		query(collection(db, `RetrospectiveItems`), where(`productId`, `==`, activeProductId)).withConverter(
			RetrospectiveItemConverter,
		),
	)

	const [currentTab, setCurrentTab] = useState<`enjoyable` | `puzzling` | `frustrating`>(`enjoyable`)
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)

	const itemsForCurrentTab = retrospectiveItems?.docs.filter((item) => item.data().type === currentTab) ?? []

	const usersData = useQueries({
		queries: itemsForCurrentTab.map((item) => ({
			queryKey: [`user`, item.data().userId],
			queryFn: async () => await getDoc(doc(db, `Users`, item.data().userId).withConverter(UserConverter)),
		})),
	})

	const usersOwnItem = itemsForCurrentTab.find((item) => item.data().userId === user?.id)
	const userFirst = itemsForCurrentTab.filter((item) => item.data().userId !== user?.id)
	if (usersOwnItem) userFirst.unshift(usersOwnItem)

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
							<Switch />
						</div>
					</div>
					<p>Which aspects have team members had fun with?</p>
				</div>

				{userFirst.length > 0 ? (
					<Masonry
						breakpointCols={{default: 4, 1700: 3, 1300: 2, 1000: 1}}
						className="flex gap-8"
						columnClassName="flex flex-col gap-8"
					>
						{userFirst.map((item) => (
							<Card
								key={item.id}
								type="inner"
								title={(() => {
									const user = usersData.find((user) => user.data?.id === item.data().userId)?.data

									return (
										<div className="my-4 flex items-center gap-4">
											<Avatar src={user?.data()?.avatar} shape="square" size="large" />
											<p>{user?.data()?.name}</p>
										</div>
									)
								})()}
								extra={
									item.data().userId === user?.id ? (
										<Button size="small" onClick={() => setIsDrawerOpen(true)}>
											Edit
										</Button>
									) : undefined
								}
							>
								<div className="flex flex-col items-start gap-2">
									<Tag>{item.data().proposedActions.length} proposed actions</Tag>
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
					onClick={() => setIsDrawerOpen(true)}
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

			{!loading && isDrawerOpen && (
				<RetrospectiveDrawer
					initialValues={
						usersOwnItem?.data() ?? {
							description: ``,
							proposedActions: [],
							title: ``,
							type: currentTab,
						}
					}
					onCancel={() => setIsDrawerOpen(false)}
					onCommit={async (values) => {
						const data: RetrospectiveItem = {
							...values,
							productId: activeProductId,
							userId: user!.id as Id,
						}
						if (usersOwnItem) {
							await setDoc(doc(db, `RetrospectiveItems`, usersOwnItem.id), data)
						} else {
							await addDoc(collection(db, `RetrospectiveItems`), data)
						}
						setIsDrawerOpen(false)
					}}
				/>
			)}
		</div>
	)
}

export default RetrospectiveClientPage
