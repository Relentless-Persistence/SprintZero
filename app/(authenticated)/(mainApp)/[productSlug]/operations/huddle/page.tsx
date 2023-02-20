"use client"

import {useQueries} from "@tanstack/react-query"
import {Avatar, Breadcrumb, Card, Checkbox, Input, Tabs} from "antd"
import dayjs from "dayjs"
import {addDoc, arrayUnion, collection, doc, getDoc, query, updateDoc, where} from "firebase/firestore"
import produce from "immer"
import {nanoid} from "nanoid"
import {useState} from "react"
import {useCollectionData, useDocumentData} from "react-firebase-hooks/firestore"

import type {WithFieldValue} from "firebase/firestore"
import type {FC} from "react"
import type {Huddle} from "~/types/db/Huddles"

import FunCard from "./FunCard"
import {HuddleConverter} from "~/types/db/Huddles"
import {ProductConverter} from "~/types/db/Products"
import {UserConverter} from "~/types/db/Users"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"


const tabs = [
	{key: `0`, label: `Today`},
	{key: `1`, label: `Yesterday`},
	{key: `2`, label: `2 days ago`},
	{key: `3`, label: `3 days ago`},
	{key: `7`, label: `1 week ago`},
	{key: `14`, label: `2 weeks ago`},
	{key: `30`, label: `1 month ago`},
] as const

const HuddlePage: FC = () => {
	const activeProductId = useActiveProductId()
	const [activeProduct] = useDocumentData(doc(db, `Products`, activeProductId).withConverter(ProductConverter))

	const [currentTab, setCurrentTab] = useState<(typeof tabs)[number][`key`]>(tabs[0].key)
	const [newBlockerText, setNewBlockerText] = useState(``)
	const [newTaskTodayText, setNewTaskTodayText] = useState(``)
	const [newTaskYesterdayText, setNewTaskYesterdayText] = useState(``)

	const date = currentTab === `30` ? dayjs().subtract(1, `month`) : dayjs().subtract(Number(currentTab), `day`)
	const formattedDateToday = dayjs(date).format(`YYYY-MM-DD`)
	const formattedDateYesterday = dayjs(date).subtract(1, `day`).format(`YYYY-MM-DD`)
	const [huddles] = useCollectionData(
		query(
			collection(db, `Products`, activeProductId, `Huddles`),
			where(`date`, `in`, [formattedDateToday, formattedDateYesterday]),
		).withConverter(HuddleConverter),
	)

	const usersData = useQueries({
		queries: activeProduct
			? Object.keys(activeProduct.members).map((userId) => ({
					queryKey: [`user`, userId],
					queryFn: async () => (await getDoc(doc(db, `Users`, userId).withConverter(UserConverter))).data(),
			  }))
			: [],
	})

	return (
		<div className="grid h-full grid-cols-[1fr_max-content]">
			<div className="flex h-full w-full flex-col overflow-auto pb-8">
				<Breadcrumb className="sticky left-0 px-12 py-8">
					<Breadcrumb.Item>Operations</Breadcrumb.Item>
					<Breadcrumb.Item>Huddle</Breadcrumb.Item>
				</Breadcrumb>

				<div className="ml-12 grid grow auto-cols-[340px] grid-flow-col gap-4">

					<FunCard />

					{usersData.map(({data: user}, i) => {
						const huddleItemToday = huddles?.find(
							(huddle) => huddle.userId === user?.id && huddle.date === formattedDateToday,
						)
						const huddleItemYesterday = huddles?.find(
							(huddle) => huddle.userId === user?.id && huddle.date === formattedDateYesterday,
						)

						return (
							<Card
								key={user?.id ?? i}
								title={
									<div className="my-4 flex items-center gap-4">
										<Avatar src={user?.avatar} size="large" />
										<p>{user?.name}</p>
									</div>
								}
							>
								<div className="flex flex-col gap-4">
									<div className="flex flex-col gap-1">
										<p className="text-lg font-semibold text-gray">Blockers</p>
										<ul className="flex flex-col gap-1">
											{huddleItemToday?.blockers.map((blocker) => (
												<li key={blocker.id}>
													<Checkbox
														checked={blocker.checked}
														onChange={(e) => {
															updateDoc(
																doc(db, `Products`, activeProductId, `Huddles`, huddleItemToday.id),
																produce(huddleItemToday, (draft) => {
																	draft.blockers.find(({id}) => id === blocker.id)!.checked = e.target.checked
																}),
															).catch(console.error)
														}}
													>
														{blocker.name}
													</Checkbox>
												</li>
											))}
											<li>
												<Checkbox disabled>
													<Input
														placeholder="Add new"
														size="small"
														value={newBlockerText}
														onChange={(e) => setNewBlockerText(e.currentTarget.value)}
														onKeyDown={(e) => {
															if (e.key === `Enter`) {
																if (huddleItemToday) {
																	updateDoc(doc(db, `Products`, activeProductId, `Huddles`, huddleItemToday.id), {
																		blockers: arrayUnion({
																			id: nanoid(),
																			checked: false,
																			name: newBlockerText,
																		} satisfies Huddle[`blockers`][number]),
																	} satisfies WithFieldValue<Partial<Huddle>>)
																		.then(() => setNewBlockerText(``))
																		.catch(console.error)
																} else {
																	addDoc(collection(db, `Products`, activeProductId, `Huddles`), {
																		blockers: [{id: nanoid(), checked: false, name: newBlockerText}],
																		date: formattedDateToday,
																		tasks: [],
																		userId: user!.id,
																	} satisfies Huddle)
																		.then(() => setNewBlockerText(``))
																		.catch(console.error)
																}
															}
														}}
													/>
												</Checkbox>
											</li>
										</ul>
									</div>
									<div className="flex flex-col gap-1">
										<p className="text-lg font-semibold text-gray">Today</p>
										<ul className="flex flex-col gap-1">
											{huddleItemToday?.tasks.map((task) => (
												<li key={task.id}>
													<Checkbox
														checked={task.checked}
														onChange={(e) => {
															updateDoc(
																doc(db, `Products`, activeProductId, `Huddles`, huddleItemToday.id),
																produce(huddleItemToday, (draft) => {
																	draft.tasks.find(({id}) => id === task.id)!.checked = e.target.checked
																}),
															).catch(console.error)
														}}
													>
														{task.name}
													</Checkbox>
												</li>
											))}
											<li>
												<Checkbox disabled>
													<Input
														placeholder="Add new"
														size="small"
														value={newTaskTodayText}
														onChange={(e) => setNewTaskTodayText(e.currentTarget.value)}
														onKeyDown={(e) => {
															if (e.key === `Enter`) {
																if (huddleItemToday) {
																	updateDoc(doc(db, `Products`, activeProductId, `Huddles`, huddleItemToday.id), {
																		tasks: arrayUnion({
																			id: nanoid(),
																			checked: false,
																			name: newTaskTodayText,
																		} satisfies Huddle[`tasks`][number]),
																	} satisfies WithFieldValue<Partial<Huddle>>)
																		.then(() => setNewTaskTodayText(``))
																		.catch(console.error)
																} else {
																	addDoc(collection(db, `Products`, activeProductId, `Huddles`), {
																		blockers: [],
																		date: formattedDateToday,
																		tasks: [{id: nanoid(), checked: false, name: newTaskTodayText}],
																		userId: user!.id,
																	} satisfies Huddle)
																		.then(() => setNewTaskTodayText(``))
																		.catch(console.error)
																}
															}
														}}
													/>
												</Checkbox>
											</li>
										</ul>
									</div>
									<div className="flex flex-col gap-1">
										<p className="text-lg font-semibold text-gray">Yesterday</p>
										<ul className="flex flex-col gap-1">
											{huddleItemYesterday?.tasks.map((task) => (
												<li key={task.id}>
													<Checkbox
														checked={task.checked}
														onChange={(e) => {
															updateDoc(
																doc(db, `Products`, activeProductId, `Huddles`, huddleItemYesterday.id),
																produce(huddleItemYesterday, (draft) => {
																	draft.tasks.find(({id}) => id === task.id)!.checked = e.target.checked
																}),
															).catch(console.error)
														}}
													>
														{task.name}
													</Checkbox>
												</li>
											))}
											<li>
												<Checkbox disabled>
													<Input
														placeholder="Add new"
														size="small"
														value={newTaskYesterdayText}
														onChange={(e) => setNewTaskYesterdayText(e.currentTarget.value)}
														onKeyDown={(e) => {
															if (e.key === `Enter`) {
																if (huddleItemYesterday) {
																	updateDoc(doc(db, `Products`, activeProductId, `Huddles`, huddleItemYesterday.id), {
																		tasks: arrayUnion({
																			id: nanoid(),
																			checked: false,
																			name: newTaskYesterdayText,
																		} satisfies Huddle[`tasks`][number]),
																	} satisfies WithFieldValue<Partial<Huddle>>)
																		.then(() => setNewTaskYesterdayText(``))
																		.catch(console.error)
																} else {
																	addDoc(collection(db, `Products`, activeProductId, `Huddles`), {
																		blockers: [],
																		date: formattedDateYesterday,
																		tasks: [{id: nanoid(), checked: false, name: newTaskYesterdayText}],
																		userId: user!.id,
																	} satisfies Huddle)
																		.then(() => setNewTaskYesterdayText(``))
																		.catch(console.error)
																}
															}
														}}
													/>
												</Checkbox>
											</li>
										</ul>
									</div>
								</div>
							</Card>
						)
					})}

					{/* Spacer */}
					<div className="w-8" />
				</div>
			</div>

			<Tabs
				tabPosition="right"
				activeKey={currentTab}
				onChange={(key: (typeof tabs)[number][`key`]) => setCurrentTab(key)}
				items={[...tabs]}
			/>
		</div>
	)
}

export default HuddlePage
