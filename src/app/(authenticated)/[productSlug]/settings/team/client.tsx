"use client"

import { DeleteOutlined } from "@ant-design/icons"
import {Avatar, Breadcrumb, Card, Tabs, Tag} from "antd"
import {collection} from "firebase/firestore"
import {useEffect, useState} from "react"
import {useErrorHandler} from "react-error-boundary"
import {useCollection} from "react-firebase-hooks/firestore"

import type {FC} from "react"

const {Meta} = Card

import {useAppContext} from "~/app/(authenticated)/[productSlug]/AppContext"
import {MemberConverter} from "~/types/db/Products/Members"
import {auth} from "~/utils/firebase"
import {trpc} from "~/utils/trpc"


const TeamSettingsClientPage: FC = () => {
	const {product} = useAppContext()

	const [currentTab, setcurrentTab] = useState<`editor` | `viewer`>(`editor`)

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
								{members?.docs
									.filter((member) => member.data().type === `owner` || member.data().type === `editor`)
									.map((member, i) => (
										<Card
											key={member.id}
											actions={[
												<div key="setting" className="space-x-[10px]">
													<span>
														<DeleteOutlined />
													</span>
													{` `}
													<span>Remove</span>
												</div>,
											]}
										>
											<div className="flex items-center justify-between">
												<Meta
													avatar={<Avatar shape="square" src={member.data().avatar} />}
													title={
														<div className="space-x-1">
															<span className="capitalize">{member.data().name}</span>
															<Tag className="text-sm font-normal">
																{member.data().type === `owner` ? `Owner` : null}
															</Tag>
														</div>
													}
													description={memberEmails.data?.[member.id]}
												/>
												<Avatar size="small" style={{backgroundColor: `#DDE3D5`, color: `rgba(0, 0, 0, 0.88)`}}>
													{i + 1}
												</Avatar>
											</div>
										</Card>
									))}
							</div>
						),
					},
					{
						label: `Viewers`,
						key: `viewer`,
						children: (
							<div className="flex flex-col gap-4">
								{members?.docs
									.filter((member) => member.data().type === `viewer`)
									.map((member, i) => (
										<Card
											key={member.id}
											actions={[
												<div key="setting" className="space-x-[10px]">
													<span>
														<DeleteOutlined />
													</span>
													{` `}
													<span>Remove</span>
												</div>,
											]}
										>
											<div className="flex items-center justify-between">
												<Meta
													avatar={<Avatar shape="square" src={member.data().avatar} />}
													title={
														<div className="space-x-1">
															<span className="capitalize">{member.data().name}</span>
														</div>
													}
													description={memberEmails.data?.[member.id]}
												/>
												<Avatar size="small" style={{backgroundColor: `#DDE3D5`, color: `rgba(0, 0, 0, 0.88)`}}>
													{i + 1}
												</Avatar>
											</div>
										</Card>
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
