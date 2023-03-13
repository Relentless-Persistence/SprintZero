"use client"

import {Breadcrumb, Tabs} from "antd"
import {collection} from "firebase/firestore"
import {useEffect, useState} from "react"
import {useErrorHandler} from "react-error-boundary"
import {useCollection} from "react-firebase-hooks/firestore"

import type {FC} from "react"

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
			<Breadcrumb>
				<Breadcrumb.Item>Settings</Breadcrumb.Item>
				<Breadcrumb.Item>Team</Breadcrumb.Item>
			</Breadcrumb>

			<Tabs
				activeKey={currentTab}
				onChange={(key) => setcurrentTab(key as `editor` | `viewer`)}
				items={[
					{
						label: `Members`,
						key: `editor`,
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
						label: `Viewers`,
						key: `viewer`,
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
