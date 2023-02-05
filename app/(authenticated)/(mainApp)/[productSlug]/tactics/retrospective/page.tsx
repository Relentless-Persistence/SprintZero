"use client"

import {useQueries} from "@tanstack/react-query"
import {Avatar, Breadcrumb, Button, Card, Checkbox, Tabs} from "antd"
import clsx from "clsx"
import {addDoc, collection, doc, getDoc, query, setDoc, where} from "firebase/firestore"
import {useState} from "react"
import {useCollectionData} from "react-firebase-hooks/firestore"
import Masonry from "react-masonry-css"

import type {FC} from "react"
import type {RetrospectiveItem} from "~/types/db/RetrospectiveItems"

import RetrospectiveDrawer from "./RetrospectiveDrawer"
import NoData from "~/components/NoData"
import {RetrospectiveItemConverter, RetrospectiveItems, retrospectiveTabs} from "~/types/db/RetrospectiveItems"
import {UserConverter, Users} from "~/types/db/Users"
import {db} from "~/utils/firebase"
import {objectEntries} from "~/utils/objectMethods"
import {useActiveProductId} from "~/utils/useActiveProductId"
import {useUser} from "~/utils/useUser"

const RetrospectivePage: FC = () => {
	const user = useUser()

	const activeProductId = useActiveProductId()
	const [retrospectiveItems, loading] = useCollectionData(
		query(
			collection(db, RetrospectiveItems._),
			where(RetrospectiveItems.productId, `==`, activeProductId),
		).withConverter(RetrospectiveItemConverter),
	)

	const [currentTab, setCurrentTab] = useState<`enjoyable` | `puzzling` | `frustrating`>(`enjoyable`)
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)

	const itemsForCurrentTab = retrospectiveItems?.filter((item) => item.type === currentTab) ?? []

	const usersData = useQueries({
		queries: itemsForCurrentTab.map((item) => ({
			queryKey: [`user`, item.userId],
			queryFn: async () => (await getDoc(doc(db, Users._, item.userId).withConverter(UserConverter))).data(),
		})),
	})

	const usersOwnItem = itemsForCurrentTab.find((item) => item.userId === user?.id)
	const userFirst = itemsForCurrentTab.filter((item) => item.userId !== user?.id)
	if (usersOwnItem) userFirst.unshift(usersOwnItem)

	return (
		<div className="flex h-full items-start justify-between">
			<div className="h-full w-full space-y-8 px-12 py-8">
				<div className="flex items-center justify-between">
					<Breadcrumb>
						<Breadcrumb.Item>Tactics</Breadcrumb.Item>
						<Breadcrumb.Item>Retrospective</Breadcrumb.Item>
						<Breadcrumb.Item>{retrospectiveTabs[currentTab]}</Breadcrumb.Item>
					</Breadcrumb>

					<div>
						<Button className="bg-white" onClick={() => void setIsDrawerOpen(true)}>
							Add New
						</Button>
					</div>
				</div>

				{userFirst.length > 0 ? (
					<Masonry
						breakpointCols={{1000: 1, 1300: 2, 1600: 3}}
						className="flex gap-8"
						columnClassName="bg-clip-padding space-y-8"
					>
						{userFirst.map((item) => (
							<Card
								key={item.id}
								type="inner"
								title={(() => {
									const user = usersData.find((user) => user.data?.id === item.userId)?.data

									return (
										<div className="my-4 flex items-center gap-4">
											<Avatar src={user?.avatar} size="large" />
											<p>{user?.name}</p>
										</div>
									)
								})()}
								extra={
									item.userId === user?.id ? (
										<button type="button" onClick={() => void setIsDrawerOpen(true)} className="text-green">
											Edit
										</button>
									) : undefined
								}
							>
								<div className="flex flex-col gap-4">
									<div className="space-y-2">
										<p className="text-gray text-xl font-semibold">{item.title}</p>
										<p className="italic">{item.description}</p>
									</div>
									<div className="space-y-2">
										<p className="text-gray text-xl font-semibold">Proposed Actions</p>
										<ul>
											{item.proposedActions.map((action) => (
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
				onChange={(key: `enjoyable` | `puzzling` | `frustrating`) => void setCurrentTab(key)}
				items={objectEntries(retrospectiveTabs).map(([key, label]) => ({key, label}))}
			/>

			{!loading && isDrawerOpen && (
				<RetrospectiveDrawer
					initialValues={
						usersOwnItem ?? {
							description: ``,
							proposedActions: [],
							title: ``,
							type: currentTab,
						}
					}
					onCancel={() => void setIsDrawerOpen(false)}
					onCommit={async (values) => {
						const data: RetrospectiveItem = {
							...values,
							productId: activeProductId,
							userId: user!.id,
						}
						if (usersOwnItem) {
							await setDoc(doc(db, RetrospectiveItems._, usersOwnItem.id), data)
						} else {
							await addDoc(collection(db, RetrospectiveItems._), data)
						}
						setIsDrawerOpen(false)
					}}
				/>
			)}
		</div>
	)
}

export default RetrospectivePage
