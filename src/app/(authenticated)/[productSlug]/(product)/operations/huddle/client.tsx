"use client"

import {DownOutlined} from "@ant-design/icons"
import {useQueries} from "@tanstack/react-query"
import {Avatar, Breadcrumb, Button, Card, Dropdown} from "antd"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import {Timestamp, arrayRemove, arrayUnion, collection, doc, getDoc, query, updateDoc} from "firebase/firestore"
import {useCollection} from "react-firebase-hooks/firestore"

import type {QueryDocumentSnapshot, WithFieldValue} from "firebase/firestore"
import type {FC} from "react"
import type {Product} from "~/types/db/Products"
import type {User} from "~/types/db/Users"

import FunCard from "./FunCard"
import Story from "./Story"
import {useAppContext} from "~/app/(authenticated)/[productSlug]/AppContext"
import {HuddleConverter} from "~/types/db/Products/Huddles"
import {MemberConverter} from "~/types/db/Products/Members"
import {StoryMapItemConverter} from "~/types/db/Products/StoryMapItems"
import {VersionConverter} from "~/types/db/Products/Versions"
import {UserConverter} from "~/types/db/Users"
import {conditionalThrow} from "~/utils/conditionalThrow"
import {db} from "~/utils/firebase"
import {getStories} from "~/utils/storyMap"

dayjs.extend(relativeTime)

const HuddleClientPage: FC = () => {
	const {product, user} = useAppContext()

	const [members, , membersError] = useCollection(collection(product.ref, `Members`).withConverter(MemberConverter))
	conditionalThrow(membersError)

	const usersData = useQueries({
		queries:
			members?.docs.map((member) => ({
				queryKey: [`user`, member.id],
				queryFn: async () => await getDoc(doc(db, `Users`, member.id).withConverter(UserConverter)),
			})) ?? [],
	})
	const users = usersData
		.sort((a, b) => (a.data?.exists() && b.data?.exists() ? a.data.data().name.localeCompare(b.data.data().name) : 0))
		.map((data) => data.data)
		.filter((data): data is QueryDocumentSnapshot<User> => data?.exists() ?? false)

	const [storyMapItems] = useCollection(
		query(collection(product.ref, `StoryMapItems`)).withConverter(StoryMapItemConverter),
	)
	const [versions] = useCollection(collection(product.ref, `Versions`).withConverter(VersionConverter))
	const [huddles] = useCollection(collection(product.ref, `Huddles`).withConverter(HuddleConverter))

	return (
		<div className="flex h-full w-full flex-col overflow-auto pb-8">
			<div className="sticky left-0 flex flex-col gap-2 px-12 py-8">
				<Breadcrumb items={[{title: `Operations`}, {title: `Huddle`}]} />
				<p className="text-textTertiary">What did you do yesterday, today, and any blockers?</p>
			</div>

			<div className="ml-12 grid grow auto-cols-[24rem] grid-flow-col gap-4">
				<FunCard />

				{users.map((huddleUser) => {
					const huddle = huddles?.docs.find(({id}) => id === huddleUser.id)

					return (
						<Card
							key={huddleUser.id}
							type="inner"
							title={
								<div className="my-4 flex items-center gap-4">
									<Avatar src={huddleUser.data().avatar} size="large" shape="square" />
									<div>
										<p>{huddleUser.data().name}</p>
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
												const story = storyMapItems.docs.find(({id}) => id === storyId)
												if (!story) return null

												return (
													<Story
														key={storyId}
														storyMapItems={storyMapItems}
														versions={versions}
														storyId={storyId}
														onRemove={async () => {
															const data: WithFieldValue<Partial<Product>> = {
																[`huddles.${huddleUser.id}.updatedAt`]: Timestamp.now(),
																[`huddles.${huddleUser.id}.blockerStoryIds`]: arrayRemove(storyId),
															}
															await updateDoc(product.ref, data)
														}}
													/>
												)
											})) || <p className="italic text-textTertiary">No blockers</p>}
										{huddleUser.id === user.id &&
											storyMapItems &&
											(() => {
												const blockerStoryOptions = getStories(storyMapItems)
													.filter(({id}) => !huddle?.data().blockerStoryIds.includes(id))
													.filter((story) => story.data().peopleIds.includes(user.id))

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
																			label: item.data().name,
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
												const story = getStories(storyMapItems).find(({id}) => id === storyId)
												if (!story) return null

												return (
													<Story
														key={storyId}
														storyMapItems={storyMapItems}
														versions={versions}
														storyId={storyId}
														onRemove={async () => {
															await updateDoc(huddle.ref, {
																updatedAt: Timestamp.now(),
																todayStoryIds: arrayRemove(storyId),
															})
														}}
													/>
												)
											})) || <p className="italic text-textTertiary">No items</p>}
										{huddleUser.id === user.id &&
											storyMapItems &&
											(() => {
												const todayStoryOptions = getStories(storyMapItems)
													.filter(({id}) => !huddle?.data().todayStoryIds.includes(id))
													.filter((story) => story.data().peopleIds.includes(user.id))

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
																			label: item.data().name,
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
												const story = getStories(storyMapItems).find(({id}) => id === storyId)
												if (!story) return null

												return (
													<Story
														key={storyId}
														storyMapItems={storyMapItems}
														versions={versions}
														storyId={storyId}
														onRemove={async () => {
															await updateDoc(huddle.ref, {
																updatedAt: Timestamp.now(),
																yesterdayStoryIds: arrayRemove(storyId),
															})
														}}
													/>
												)
											})) || <p className="italic text-textTertiary">No items</p>}
										{huddleUser.id === user.id &&
											storyMapItems &&
											(() => {
												const yesterdayStoryOptions = getStories(storyMapItems)
													.filter(({id}) => !huddle?.data().yesterdayStoryIds.includes(id))
													.filter((story) => story.data().peopleIds.includes(user.id))

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
																			label: item.data().name,
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
				})}

				{/* Spacer */}
				<div className="w-8" />
			</div>
		</div>
	)
}

export default HuddleClientPage
