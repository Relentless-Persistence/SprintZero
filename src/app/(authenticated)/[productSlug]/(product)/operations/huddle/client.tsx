"use client"

import { DownOutlined } from "@ant-design/icons"
import { Avatar, Breadcrumb, Button, Card, Dropdown } from "antd"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { Timestamp, arrayRemove, arrayUnion, collection, orderBy, query, updateDoc } from "firebase/firestore"
import { useErrorHandler } from "react-error-boundary"
import { useCollection } from "react-firebase-hooks/firestore"

import type { FC } from "react"

import FunCard from "./FunCard"
import Story from "./Story"
import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import { HuddleConverter } from "~/types/db/Products/Huddles"
import { MemberConverter } from "~/types/db/Products/Members"
import { StoryMapItemConverter } from "~/types/db/Products/StoryMapItems"
import { VersionConverter } from "~/types/db/Products/Versions"
import { getStories } from "~/utils/storyMap"

dayjs.extend(relativeTime)

const HuddleClientPage: FC = () => {
	const { product, user } = useAppContext()

	const [members, , membersError] = useCollection(
		query(collection(product.ref, `Members`), orderBy(`name`, `asc`)).withConverter(MemberConverter),
	)
	useErrorHandler(membersError)

	const [storyMapItems, , storyMapItemsError] = useCollection(
		query(collection(product.ref, `StoryMapItems`)).withConverter(StoryMapItemConverter),
	)
	useErrorHandler(storyMapItemsError)
	const [versions, , versionsError] = useCollection(collection(product.ref, `Versions`).withConverter(VersionConverter))
	useErrorHandler(versionsError)
	const [huddles, , huddlesError] = useCollection(collection(product.ref, `Huddles`).withConverter(HuddleConverter))
	useErrorHandler(huddlesError)

	return (
		<div className="flex h-full w-full flex-col pb-8">
			<div className="sticky left-0 flex flex-col gap-2 px-12 py-8">
				<Breadcrumb items={[{ title: `Operations` }, { title: `Huddle` }]} />
				<p className="text-textTertiary">What did you do yesterday, today, and any blockers?</p>
			</div>

			<div className="ml-12 grid min-h-0 grow auto-cols-[24rem] grid-flow-col gap-4">
				<FunCard />

				{members?.docs.map((member) => {

					if (member.id === user.id) {
						const huddle = huddles?.docs.find(({ id }) => id === user.id)

						return (
							<Card
								key={member.id}
								type="inner"
								className="flex min-h-0 flex-col [&>.ant-card-body]:min-h-0 [&>.ant-card-body]:flex-1 [&>.ant-card-body]:overflow-auto [&>.ant-card-head]:shrink-0"
								title={
									<div className="my-4 flex items-center gap-4">
										<Avatar src={member.data().avatar} size="large" shape="square" />
										<div>
											<p>{member.data().name}</p>
											{huddle && (
												<p className="text-sm font-normal text-textTertiary">
													Updated {dayjs(huddle.data().updatedAt.toMillis()).fromNow()}
												</p>
											)}
										</div>
									</div>
								}
							>
								<div className="flex flex-col gap-4">
									<div>
										<p className="font-semibold">Blockers</p>
										<div className="mt-1 flex flex-col gap-2">
											{(storyMapItems &&
												versions &&
												huddle?.data().blockerStoryIds.map((storyId) => {
													const story = storyMapItems.docs.find(({ id }) => id === storyId)
													if (!story) return null

													return (
														<Story
															key={storyId}
															storyMapItems={storyMapItems}
															versions={versions}
															storyId={storyId}
															onRemove={
																member.id === user.id
																	? async () => {
																		await updateDoc(huddle.ref, {
																			updatedAt: Timestamp.now(),
																			blockerStoryIds: arrayRemove(storyId),
																		})
																	}
																	: undefined
															}
														/>
													)
												})) || <p className="italic text-textTertiary">No blockers</p>}
											{member.id === user.id &&
												storyMapItems &&
												(() => {
													const blockerStoryOptions = getStories(storyMapItems.docs.map((item) => item.data()))
														.filter(({ id }) => !huddle?.data().blockerStoryIds.includes(id))
														.filter((story) => story.peopleIds.includes(user.id))

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
																		: blockerStoryOptions.map((item) => ({
																			key: item.id,
																			label: item.name,
																			onClick: async () => {
																				if (!huddle) return
																				await updateDoc(huddle.ref, {
																					updatedAt: Timestamp.now(),
																					blockerStoryIds: arrayUnion(item.id),
																				})
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
											{(storyMapItems &&
												versions &&
												huddle?.data().todayStoryIds.map((storyId) => {
													const story = getStories(storyMapItems.docs.map((item) => item.data())).find(
														({ id }) => id === storyId,
													)
													if (!story) return null

													return (
														<Story
															key={storyId}
															storyMapItems={storyMapItems}
															versions={versions}
															storyId={storyId}
															onRemove={
																member.id === user.id
																	? async () => {
																		await updateDoc(huddle.ref, {
																			updatedAt: Timestamp.now(),
																			todayStoryIds: arrayRemove(storyId),
																		})
																	}
																	: undefined
															}
														/>
													)
												})) || <p className="italic text-textTertiary">No items</p>}
											{member.id === user.id &&
												storyMapItems &&
												(() => {
													const todayStoryOptions = getStories(storyMapItems.docs.map((item) => item.data()))
														.filter(({ id }) => !huddle?.data().todayStoryIds.includes(id))
														.filter((story) => story.peopleIds.includes(user.id))

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
																		: todayStoryOptions.map((item) => ({
																			key: item.id,
																			label: item.name,
																			onClick: async () => {
																				if (!huddle) return
																				await updateDoc(huddle.ref, {
																					updatedAt: Timestamp.now(),
																					todayStoryIds: arrayUnion(item.id),
																				})
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
											{(storyMapItems &&
												versions &&
												huddle?.data().yesterdayStoryIds.map((storyId) => {
													const story = getStories(storyMapItems.docs.map((item) => item.data())).find(
														({ id }) => id === storyId,
													)
													if (!story) return null

													return (
														<Story
															key={storyId}
															storyMapItems={storyMapItems}
															versions={versions}
															storyId={storyId}
															onRemove={
																member.id === user.id
																	? async () => {
																		await updateDoc(huddle.ref, {
																			updatedAt: Timestamp.now(),
																			yesterdayStoryIds: arrayRemove(storyId),
																		})
																	}
																	: undefined
															}
														/>
													)
												})) || <p className="italic text-textTertiary">No items</p>}
											{member.id === user.id &&
												storyMapItems &&
												(() => {
													const yesterdayStoryOptions = getStories(storyMapItems.docs.map((item) => item.data()))
														.filter(({ id }) => !huddle?.data().yesterdayStoryIds.includes(id))
														.filter((story) => story.peopleIds.includes(user.id))

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
																		: yesterdayStoryOptions.map((item) => ({
																			key: item.id,
																			label: item.name,
																			onClick: async () => {
																				if (!huddle) return
																				await updateDoc(huddle.ref, {
																					updatedAt: Timestamp.now(),
																					yesterdayStoryIds: arrayUnion(item.id),
																				})
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
					}
				})}

				{members?.docs.map((member) => {

					if (member.id !== user.id) {
						const huddle = huddles?.docs.find(({ id }) => id === member.id && id !== user.id)

						return (
							<Card
								key={member.id}
								type="inner"
								className="flex min-h-0 flex-col [&>.ant-card-body]:min-h-0 [&>.ant-card-body]:flex-1 [&>.ant-card-body]:overflow-auto [&>.ant-card-head]:shrink-0"
								title={
									<div className="my-4 flex items-center gap-4">
										<Avatar src={member.data().avatar} size="large" shape="square" />
										<div>
											<p>{member.data().name}</p>
											{huddle && (
												<p className="text-sm font-normal text-textTertiary">
													Updated {dayjs(huddle.data().updatedAt.toMillis()).fromNow()}
												</p>
											)}
										</div>
									</div>
								}
							>
								<div className="flex flex-col gap-4">
									<div>
										<p className="font-semibold">Blockers</p>
										<div className="mt-1 flex flex-col gap-2">
											{(storyMapItems &&
												versions &&
												huddle?.data().blockerStoryIds.map((storyId) => {
													const story = storyMapItems.docs.find(({ id }) => id === storyId)
													if (!story) return null

													return (
														<Story
															key={storyId}
															storyMapItems={storyMapItems}
															versions={versions}
															storyId={storyId}
															onRemove={
																member.id === user.id
																	? async () => {
																		await updateDoc(huddle.ref, {
																			updatedAt: Timestamp.now(),
																			blockerStoryIds: arrayRemove(storyId),
																		})
																	}
																	: undefined
															}
														/>
													)
												})) || <p className="italic text-textTertiary">No blockers</p>}
											{member.id === user.id &&
												storyMapItems &&
												(() => {
													const blockerStoryOptions = getStories(storyMapItems.docs.map((item) => item.data()))
														.filter(({ id }) => !huddle?.data().blockerStoryIds.includes(id))
														.filter((story) => story.peopleIds.includes(user.id))

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
																		: blockerStoryOptions.map((item) => ({
																			key: item.id,
																			label: item.name,
																			onClick: async () => {
																				if (!huddle) return
																				await updateDoc(huddle.ref, {
																					updatedAt: Timestamp.now(),
																					blockerStoryIds: arrayUnion(item.id),
																				})
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
											{(storyMapItems &&
												versions &&
												huddle?.data().todayStoryIds.map((storyId) => {
													const story = getStories(storyMapItems.docs.map((item) => item.data())).find(
														({ id }) => id === storyId,
													)
													if (!story) return null

													return (
														<Story
															key={storyId}
															storyMapItems={storyMapItems}
															versions={versions}
															storyId={storyId}
															onRemove={
																member.id === user.id
																	? async () => {
																		await updateDoc(huddle.ref, {
																			updatedAt: Timestamp.now(),
																			todayStoryIds: arrayRemove(storyId),
																		})
																	}
																	: undefined
															}
														/>
													)
												})) || <p className="italic text-textTertiary">No items</p>}
											{member.id === user.id &&
												storyMapItems &&
												(() => {
													const todayStoryOptions = getStories(storyMapItems.docs.map((item) => item.data()))
														.filter(({ id }) => !huddle?.data().todayStoryIds.includes(id))
														.filter((story) => story.peopleIds.includes(user.id))

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
																		: todayStoryOptions.map((item) => ({
																			key: item.id,
																			label: item.name,
																			onClick: async () => {
																				if (!huddle) return
																				await updateDoc(huddle.ref, {
																					updatedAt: Timestamp.now(),
																					todayStoryIds: arrayUnion(item.id),
																				})
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
											{(storyMapItems &&
												versions &&
												huddle?.data().yesterdayStoryIds.map((storyId) => {
													const story = getStories(storyMapItems.docs.map((item) => item.data())).find(
														({ id }) => id === storyId,
													)
													if (!story) return null

													return (
														<Story
															key={storyId}
															storyMapItems={storyMapItems}
															versions={versions}
															storyId={storyId}
															onRemove={
																member.id === user.id
																	? async () => {
																		await updateDoc(huddle.ref, {
																			updatedAt: Timestamp.now(),
																			yesterdayStoryIds: arrayRemove(storyId),
																		})
																	}
																	: undefined
															}
														/>
													)
												})) || <p className="italic text-textTertiary">No items</p>}
											{member.id === user.id &&
												storyMapItems &&
												(() => {
													const yesterdayStoryOptions = getStories(storyMapItems.docs.map((item) => item.data()))
														.filter(({ id }) => !huddle?.data().yesterdayStoryIds.includes(id))
														.filter((story) => story.peopleIds.includes(user.id))

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
																		: yesterdayStoryOptions.map((item) => ({
																			key: item.id,
																			label: item.name,
																			onClick: async () => {
																				if (!huddle) return
																				await updateDoc(huddle.ref, {
																					updatedAt: Timestamp.now(),
																					yesterdayStoryIds: arrayUnion(item.id),
																				})
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
					}
				})}

				{/* Spacer */}
				<div className="w-8" />
			</div>
		</div>
	)
}

export default HuddleClientPage
