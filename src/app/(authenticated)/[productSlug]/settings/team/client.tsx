"use client"

import {useQueries} from "@tanstack/react-query"
import {Breadcrumb, Tabs} from "antd"
import {collection, doc, getDoc} from "firebase/firestore"
import {useState} from "react"
import {useCollection} from "react-firebase-hooks/firestore"

import type {QueryDocumentSnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {User} from "~/types/db/Users"

import {useAppContext} from "~/app/(authenticated)/[productSlug]/AppContext"
import {MemberConverter} from "~/types/db/Products/Members"
import {UserConverter} from "~/types/db/Users"
import {conditionalThrow} from "~/utils/conditionalThrow"
import {db} from "~/utils/firebase"

const TeamSettingsClientPage: FC = () => {
	const {product} = useAppContext()

	const [currentTab, setcurrentTab] = useState<`editor` | `viewer`>(`editor`)

	const [members, , membersError] = useCollection(collection(product.ref, `Members`).withConverter(MemberConverter))
	conditionalThrow(membersError)

	const _memberUsers = useQueries({
		queries:
			members?.docs.map((member) => ({
				queryKey: [`user`, member.id],
				queryFn: async () => await getDoc(doc(db, `Users`, member.id).withConverter(UserConverter)),
			})) ?? [],
	})
	conditionalThrow(membersError, ..._memberUsers.map((product) => product.error))
	const memberUsers = _memberUsers
		.map((user) => user.data)
		.filter((user): user is QueryDocumentSnapshot<User> => user?.exists() ?? false)

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
								{memberUsers.map((member) => (
									<div key={member.id} className="flex flex-col gap-1 border border-border bg-white px-6 py-4">
										<p className="font-semibold">{member.data().name}</p>
										<p>{member.data().email}</p>
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
								{memberUsers.map((member) => (
									<div key={member.id} className="flex flex-col gap-1 border border-border bg-white px-6 py-4">
										<p className="font-semibold">{member.data().name}</p>
										<p>{member.data().email}</p>
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
