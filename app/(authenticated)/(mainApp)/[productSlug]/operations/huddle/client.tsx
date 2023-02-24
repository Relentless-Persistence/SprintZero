"use client"

import {useQueries} from "@tanstack/react-query"
import {Avatar, Breadcrumb, Card, Select} from "antd"
import {collection, doc, getDoc, query, where} from "firebase/firestore"
import {useCollection, useDocument} from "react-firebase-hooks/firestore"

import type {QueryDocumentSnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {Id} from "~/types"
import type {User} from "~/types/db/Users"

import FunCard from "./FunCard"
import {ProductConverter} from "~/types/db/Products"
import {StoryMapStateConverter} from "~/types/db/StoryMapStates"
import {UserConverter} from "~/types/db/Users"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

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
										<Avatar src={user.data().avatar} size="large" />
										<p>{user.data().name}</p>
									</div>
								}
							>
								<div className="flex flex-col gap-4">
									<div className="flex flex-col gap-1">
										<p className="text-lg font-semibold">Blockers</p>
										{storyMapState &&
											huddle?.blockerStoryIds.map((storyId) => {
												const story = Object.entries(storyMapState.data().items).find(([id]) => id === storyId)?.[1]
												if (!story) return null

												return <li key={storyId}>{story.name}</li>
											})}
										{storyMapState && (
											<Select
												placeholder="Add blocker"
												options={Object.entries(storyMapState.data().items).map(([id, item]) => ({
													label: item?.name,
													value: id,
												}))}
											/>
										)}
									</div>
									<div className="flex flex-col gap-1">
										<p className="text-lg font-semibold">Today</p>
										{storyMapState &&
											huddle?.todayStoryIds.map((storyId) => {
												const story = Object.entries(storyMapState.data().items).find(([id]) => id === storyId)?.[1]
												if (!story) return null

												return <li key={storyId}>{story.name}</li>
											})}
										{storyMapState && (
											<Select
												placeholder="Add story"
												options={Object.entries(storyMapState.data().items).map(([id, item]) => ({
													label: item?.name,
													value: id,
												}))}
											/>
										)}
									</div>
									<div className="flex flex-col gap-1">
										<p className="text-lg font-semibold">Yesterday</p>
										{storyMapState &&
											huddle?.todayStoryIds.map((storyId) => {
												const story = Object.entries(storyMapState.data().items).find(([id]) => id === storyId)?.[1]
												if (!story) return null

												return <li key={storyId}>{story.name}</li>
											})}
										{storyMapState && (
											<Select
												placeholder="Add story"
												options={Object.entries(storyMapState.data().items).map(([id, item]) => ({
													label: item?.name,
													value: id,
												}))}
											/>
										)}
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
