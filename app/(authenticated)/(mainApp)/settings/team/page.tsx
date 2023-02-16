"use client"

import {useQueries} from "@tanstack/react-query"
import {Breadcrumb, Tabs} from "antd"
import {collection, doc, getDoc, query, where} from "firebase/firestore"
import {useState} from "react"
import {useCollectionData} from "react-firebase-hooks/firestore"

import type {FC} from "react"

import {ProductConverter} from "~/types/db/Products"
import {UserConverter} from "~/types/db/Users"
import {db} from "~/utils/firebase"
import {useUser} from "~/utils/useUser"

const TeamSettingsPage: FC = () => {
	const user = useUser()
	const [allProducts] = useCollectionData(
		user
			? query(collection(db, `Products`), where(`members.${user.id}.type`, `==`, `editor`)).withConverter(
					ProductConverter,
			  )
			: undefined,
	)
	// Technically the user can be a part of multiple products, but this page is only designed for one for now.
	const firstProduct = allProducts?.[0]

	const [currentTab, setcurrentTab] = useState<`editor` | `viewer`>(`editor`)

	const members = useQueries({
		queries: firstProduct
			? Object.entries(firstProduct.members)
					.filter(([, info]) => info?.type === currentTab)
					.map(([id]) => ({
						queryKey: [`user`, id],
						queryFn: async () => await getDoc(doc(db, `Users`, id).withConverter(UserConverter)),
					}))
			: [],
	})

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
								{members.map(
									({data: member}) =>
										member?.exists() && (
											<div key={member.id} className="flex flex-col gap-1 border border-[#d9d9d9] bg-white px-6 py-4">
												<p className="font-semibold">{member.data().name}</p>
												<p>{member.data().email}</p>
											</div>
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
								{members.map(
									({data: member}) =>
										member?.exists() && (
											<div key={member.id} className="flex flex-col gap-1 border border-[#d9d9d9] bg-white px-6 py-4">
												<p className="font-semibold">{member.data().name}</p>
												<p>{member.data().email}</p>
											</div>
										),
								)}
							</div>
						),
					},
				]}
			/>
		</div>
	)
}

export default TeamSettingsPage
