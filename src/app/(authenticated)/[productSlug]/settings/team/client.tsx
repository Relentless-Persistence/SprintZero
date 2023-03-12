"use client"

<<<<<<< HEAD
import {Breadcrumb, Tabs} from "antd"
import {collection} from "firebase/firestore"
import {useEffect, useState} from "react"
import {useErrorHandler} from "react-error-boundary"
import {useCollection} from "react-firebase-hooks/firestore"
=======
import {DeleteOutlined} from "@ant-design/icons"
import {useQueries} from "@tanstack/react-query"
import {Avatar, Breadcrumb, Card, Tabs, Tag} from "antd"
import {collection, doc, getDoc, query, where} from "firebase/firestore"
import {useState} from "react"
import {useCollectionData, useDocument} from "react-firebase-hooks/firestore"
>>>>>>> 2fc32b8... Teams UI

import type {FC} from "react"

import {useAppContext} from "~/app/(authenticated)/[productSlug]/AppContext"
import {MemberConverter} from "~/types/db/Products/Members"
<<<<<<< HEAD
import {auth} from "~/utils/firebase"
import {trpc} from "~/utils/trpc"
=======
import {UserConverter} from "~/types/db/Users"
import {conditionalThrow} from "~/utils/conditionalThrow"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"
import {useUser} from "~/utils/useUser"

const {Meta} = Card
>>>>>>> 2fc32b8... Teams UI

const TeamSettingsClientPage: FC = () => {
	const {product} = useAppContext()

	const [currentTab, setcurrentTab] = useState<`editor` | `viewer` | `removed`>(`editor`)

	const [members, , membersError] = useCollection(collection(product.ref, `Members`).withConverter(MemberConverter))
	useErrorHandler(membersError)
	const [token, setToken] = useState<string | undefined>(undefined)
	useEffect(() => {
		auth.currentUser?.getIdToken().then(setToken).catch(console.error)
	}, [])
	const memberEmails = trpc.product.getMemberEmails.useQuery(
		{productId: product.id, userIdToken: token!},
		{enabled: !!token},
	)

	return (
		<div className="flex flex-col gap-6 px-12 py-8">
			<Breadcrumb items={[{title: `Settings`}, {title: `Team`}]} />

			<Tabs
				activeKey={currentTab}
				onChange={(key) => setcurrentTab(key as `editor` | `viewer`)}
				items={[
					{
						label: `Members`,
						key: `editor`,
						children: (
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
								{members.map(
									({data: member}, i) =>
										member?.exists() && (
											<Card
												key={member.id}
												// style={{width: 300}}
												actions={[
													<div className="space-x-[10px]" key="remove">
														<DeleteOutlined /> <span>Remove</span>
													</div>,
												]}
											>
												<div className="flex items-center justify-between">
													<Meta
														avatar={<Avatar src={member.data().avatar} />}
														title={
															<div>
																<span>{member.data().name}</span> <Tag className="font-normal">Owner</Tag>
															</div>
														}
														description={member.data().email}
													/>
													<Avatar style={{backgroundColor: `#DDE3D5`, color: `rgba(0, 0, 0, 0.88)`}} size="small">
														{i + 1}
													</Avatar>
												</div>
											</Card>
										),
								)}
							</div>
						),
					},
					{
						label: `Viewers`,
						key: `viewer`,
						children: (
							<div className="flex flex-col gap-4">
								{members?.docs
									.filter((member) => member.data().type === `editor`)
									.map((member) => (
										<div key={member.id} className="flex flex-col gap-1 border border-border bg-white px-6 py-4">
											<p className="font-semibold">{member.data().name}</p>
											<p>{memberEmails.data?.[member.id]}</p>
										</div>
									))}
							</div>
						),
					},
					{
						label: `Removed`,
						key: `removed`,
						children: (
							<div className="flex flex-col gap-4">
								{members?.docs
									.filter((member) => member.data().type === `viewer`)
									.map((member) => (
										<div key={member.id} className="flex flex-col gap-1 border border-border bg-white px-6 py-4">
											<p className="font-semibold">{member.data().name}</p>
											<p>{memberEmails.data?.[member.id]}</p>
										</div>
									))}
							</div>
						),
					},
				]}
			/>
		</div>
	)
}

export default TeamSettingsClientPage
