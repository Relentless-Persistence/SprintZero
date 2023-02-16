"use client"

import {useQueries} from "@tanstack/react-query"
import {Avatar, Breadcrumb, Button, Card, Checkbox, Tabs} from "antd"
import clsx from "clsx"
import {addDoc, collection, doc, getDoc, query, setDoc, where} from "firebase/firestore"
import {useState} from "react"
import {useCollection} from "react-firebase-hooks/firestore"
import Masonry from "react-masonry-css"

import type {FC} from "react"
import type {Id} from "~/types"
import type {RetrospectiveItem} from "~/types/db/RetrospectiveItems"

import RetrospectiveDrawer from "./RetrospectiveDrawer"
import NoData from "~/components/NoData"
import {RetrospectiveItemConverter, retrospectiveTabs} from "~/types/db/RetrospectiveItems"
import {UserConverter} from "~/types/db/Users"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"
import {useUser} from "~/utils/useUser"

const RetrospectivePage: FC = () => {
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
			<div className="flex h-full w-full flex-col gap-8 px-12 py-8">
				<div className="flex items-center justify-between">
					<Breadcrumb>
						<Breadcrumb.Item>Tactics</Breadcrumb.Item>
						<Breadcrumb.Item>Retrospective</Breadcrumb.Item>
						<Breadcrumb.Item>{retrospectiveTabs[currentTab]}</Breadcrumb.Item>
					</Breadcrumb>

					<div>
						<Button className="bg-white" onClick={() => setIsDrawerOpen(true)}>
							Add New
						</Button>
					</div>
				</div>

				{userFirst.length > 0 ? (
					<Masonry
						breakpointCols={{1000: 1, 1300: 2, 1600: 3}}
						className="flex gap-8"
						columnClassName="bg-clip-padding flex flex-col gap-8"
					>
						{userFirst.map((item) => (
							<Card
								key={item.id}
								type="inner"
								title={(() => {
									const user = usersData.find((user) => user.data?.id === item.data().userId)?.data

									return (
										<div className="my-4 flex items-center gap-4">
											<Avatar src={user?.data()?.avatar} size="large" />
											<p>{user?.data()?.name}</p>
										</div>
									)
								})()}
								extra={
									item.data().userId === user?.id ? (
										<button type="button" onClick={() => setIsDrawerOpen(true)} className="text-green">
											Edit
										</button>
									) : undefined
								}
							>
								<div className="flex flex-col gap-4">
									<div className="flex flex-col gap-2">
										<p className="text-xl font-semibold text-gray">{item.data().title}</p>
										<p className="italic">{item.data().description}</p>
									</div>
									<div className="flex flex-col gap-2">
										<p className="text-xl font-semibold text-gray">Proposed Actions</p>
										<ul>
											{item.data().proposedActions.map((action) => (
												<li key={action.id}>
													<Checkbox
														checked={action.checked}
														className={clsx(`pointer-events-none`, action.checked && `line-through`)}
													>
														{action.label}
													</Checkbox>
												</li>
											))}
										</ul>
									</div>
								</div>
							</Card>
						))}
					</Masonry>
				) : (
					<div className="grid h-full place-items-center">
						<NoData />
					</div>
				)}
			</div>

			<Tabs
				tabPosition="right"
				activeKey={currentTab}
				onChange={(key: `enjoyable` | `puzzling` | `frustrating`) => setCurrentTab(key)}
				items={Object.entries(retrospectiveTabs).map(([key, label]) => ({key, label}))}
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

export default RetrospectivePage
