"use client"

import {DownOutlined} from "@ant-design/icons"
import {useQueries} from "@tanstack/react-query"
import {Avatar, Breadcrumb, Button, Card, Dropdown} from "antd"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import {Timestamp, arrayRemove, arrayUnion, collection, doc, getDoc, query, updateDoc, where} from "firebase/firestore"
import {useCollection, useDocument} from "react-firebase-hooks/firestore"

import type {QueryDocumentSnapshot, WithFieldValue} from "firebase/firestore"
import type {FC} from "react"
import type {Id} from "~/types"
import type {Product} from "~/types/db/Products"
import type {User} from "~/types/db/Users"

import FunCard from "./FunCard"
import Story from "./Story"
import {ProductConverter} from "~/types/db/Products"
import {StoryMapStateConverter} from "~/types/db/StoryMapStates"
import {UserConverter} from "~/types/db/Users"
import {VersionConverter} from "~/types/db/Versions"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

dayjs.extend(relativeTime)

const HuddleClientPage: FC = () => {
	const activeProductId = useActiveProductId()
	const [activeProduct] = useDocument(doc(db, `Products`, activeProductId).withConverter(ProductConverter))

	const usersData = useQueries({
		queries: activeProduct?.exists()
			? Object.keys(activeProduct.data().members).map((userId) => ({
					queryKey: [`user`, userId],
					queryFn: async () => await getDoc(doc(db, `Users`, userId).withConverter(UserConverter)),
			  }))
			: [],
	})

	const [storyMapStates] = useCollection(
		query(collection(db, `StoryMapStates`), where(`productId`, `==`, activeProductId)).withConverter(
			StoryMapStateConverter,
		),
	)
	const storyMapState = storyMapStates?.docs[0]

	const [versions] = useCollection(
		storyMapState
			? collection(db, `StoryMapStates`, storyMapState.id, `Versions`).withConverter(VersionConverter)
			: undefined,
	)

	return (
		<div className="flex h-full w-full flex-col overflow-auto pb-8">
			<div className="sticky left-0 flex flex-col gap-2 px-12 py-8">
				<Breadcrumb>
					<Breadcrumb.Item>Operations</Breadcrumb.Item>
					<Breadcrumb.Item>Huddle</Breadcrumb.Item>
				</Breadcrumb>
				<p className="text-textTertiary">What did you do yesterday, today, and any blockers?</p>
			</div>

			<div className="ml-12 grid grow auto-cols-[24rem] grid-flow-col gap-4">
				<FunCard />

				{usersData
					.map((data) => data.data)
					.filter((data): data is QueryDocumentSnapshot<User> => data?.exists() ?? false)
					.map((user) => {
						if (!activeProduct?.exists()) return null
						const huddle = activeProduct.data().huddles[user.id as Id]

						return (
							<Card
								key={user.id}
								type="inner"
								title={
									<div className="my-4 flex items-center gap-4">
										<Avatar src={user.data().avatar} size="large" shape="square" />
										<div>
											<p>{user.data().name}</p>
											<p className="text-sm font-normal text-textTertiary">
												Updated {huddle ? dayjs(huddle.updatedAt.toMillis()).fromNow() : ``}
											</p>
										</div>
									</div>
								}
							>
								<div className="flex flex-col gap-4">
									<div>
										<p className="font-semibold">Blockers</p>
										<div className="mt-1 flex flex-col gap-2">
											{storyMapState &&
												versions &&
												huddle?.blockerStoryIds.map((storyId) => {
													const story = Object.entries(storyMapState.data().items).find(([id]) => id === storyId)?.[1]
													if (!story) return null

													return (
														<Story
															key={storyId}
															storyMapState={storyMapState}
															versions={versions}
															storyId={storyId}
															onRemove={async () => {
																const data: WithFieldValue<Partial<Product>> = {
																	[`huddles.${user.id}.updatedAt`]: Timestamp.now(),
																	[`huddles.${user.id}.blockerStoryIds`]: arrayRemove(storyId),
																}
																await updateDoc(
																	doc(db, `Products`, activeProductId).withConverter(ProductConverter),
																	data,
																)
															}}
														/>
													)
												})}
											{storyMapState &&
												(() => {
													const blockerStoryOptions = Object.entries(storyMapState.data().items)
														.filter(([, item]) => item?.type === `story`)
														.filter(([id]) => !huddle?.blockerStoryIds.includes(id as Id))

													return (
														<Dropdown
															trigger={[`click`]}
															menu={{
																items:
																	blockerStoryOptions.length === 0
																		? [
																				{
																					key: `empty`,
																					label: <span className="italic text-textTertiary">No more stories</span>,
																				},
																		  ]
																		: blockerStoryOptions.map(([id, item]) => ({
																				key: id,
																				label: item?.name,
																				onClick: async () => {
																					const data: WithFieldValue<Partial<Product>> = {
																						[`huddles.${user.id}.updatedAt`]: Timestamp.now(),
																						[`huddles.${user.id}.blockerStoryIds`]: arrayUnion(id),
																					}
																					await updateDoc(
																						doc(db, `Products`, activeProductId).withConverter(ProductConverter),
																						data,
																					)
																				},
																		  })),
															}}
														>
															<Button className="flex items-center justify-between">
																Add blocker
																<DownOutlined />
															</Button>
														</Dropdown>
													)
												})()}
										</div>
									</div>
									<div>
										<p className="font-semibold">Today</p>
										<div className="mt-1 flex flex-col gap-2">
											{storyMapState &&
												versions &&
												huddle?.todayStoryIds.map((storyId) => {
													const story = Object.entries(storyMapState.data().items).find(([id]) => id === storyId)?.[1]
													if (!story) return null

													return (
														<Story
															key={storyId}
															storyMapState={storyMapState}
															versions={versions}
															storyId={storyId}
															onRemove={async () => {
																const data: WithFieldValue<Partial<Product>> = {
																	[`huddles.${user.id}.updatedAt`]: Timestamp.now(),
																	[`huddles.${user.id}.todayStoryIds`]: arrayRemove(storyId),
																}
																await updateDoc(
																	doc(db, `Products`, activeProductId).withConverter(ProductConverter),
																	data,
																)
															}}
														/>
													)
												})}
											{storyMapState &&
												(() => {
													const todayStoryOptions = Object.entries(storyMapState.data().items)
														.filter(([, item]) => item?.type === `story`)
														.filter(([id]) => !huddle?.todayStoryIds.includes(id as Id))

													return (
														<Dropdown
															trigger={[`click`]}
															menu={{
																items:
																	todayStoryOptions.length === 0
																		? [
																				{
																					key: `empty`,
																					label: <span className="italic text-textTertiary">No more stories</span>,
																				},
																		  ]
																		: todayStoryOptions.map(([id, item]) => ({
																				key: id,
																				label: item?.name,
																				onClick: async () => {
																					const data: WithFieldValue<Partial<Product>> = {
																						[`huddles.${user.id}.updatedAt`]: Timestamp.now(),
																						[`huddles.${user.id}.todayStoryIds`]: arrayUnion(id),
																					}
																					await updateDoc(
																						doc(db, `Products`, activeProductId).withConverter(ProductConverter),
																						data,
																					)
																				},
																		  })),
															}}
														>
															<Button className="flex items-center justify-between">
																Add story
																<DownOutlined />
															</Button>
														</Dropdown>
													)
												})()}
										</div>
									</div>
									<div>
										<p className="font-semibold">Yesterday</p>
										<div className="mt-1 flex flex-col gap-2">
											{storyMapState &&
												versions &&
												huddle?.yesterdayStoryIds.map((storyId) => {
													const story = Object.entries(storyMapState.data().items).find(([id]) => id === storyId)?.[1]
													if (!story) return null

													return (
														<Story
															key={storyId}
															storyMapState={storyMapState}
															versions={versions}
															storyId={storyId}
															onRemove={async () => {
																const data: WithFieldValue<Partial<Product>> = {
																	[`huddles.${user.id}.updatedAt`]: Timestamp.now(),
																	[`huddles.${user.id}.yesterdayStoryIds`]: arrayRemove(storyId),
																}
																await updateDoc(
																	doc(db, `Products`, activeProductId).withConverter(ProductConverter),
																	data,
																)
															}}
														/>
													)
												})}
											{storyMapState &&
												(() => {
													const yesterdayStoryOptions = Object.entries(storyMapState.data().items)
														.filter(([, item]) => item?.type === `story`)
														.filter(([id]) => !huddle?.yesterdayStoryIds.includes(id as Id))

													return (
														<Dropdown
															trigger={[`click`]}
															menu={{
																items:
																	yesterdayStoryOptions.length === 0
																		? [
																				{
																					key: `empty`,
																					label: <span className="italic text-textTertiary">No more stories</span>,
																				},
																		  ]
																		: yesterdayStoryOptions.map(([id, item]) => ({
																				key: id,
																				label: item?.name,
																				onClick: async () => {
																					const data: WithFieldValue<Partial<Product>> = {
																						[`huddles.${user.id}.updatedAt`]: Timestamp.now(),
																						[`huddles.${user.id}.yesterdayStoryIds`]: arrayUnion(id),
																					}
																					await updateDoc(
																						doc(db, `Products`, activeProductId).withConverter(ProductConverter),
																						data,
																					)
																				},
																		  })),
															}}
														>
															<Button className="flex items-center justify-between">
																Add story
																<DownOutlined />
															</Button>
														</Dropdown>
													)
												})()}
										</div>
									</div>
								</div>
							</Card>
						)
					})}

				{/* Spacer */}
				<div className="w-8" />
			</div>
		</div>
	)
}

export default HuddleClientPage