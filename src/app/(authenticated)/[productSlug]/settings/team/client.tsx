"use client"

import { DeleteOutlined, DownOutlined, EditOutlined, EyeOutlined, SendOutlined, UserOutlined } from "@ant-design/icons"
import { Avatar, Breadcrumb, Button, Card, Dropdown, Input, Space, Tabs, Tag, notification } from "antd"
import { collection, deleteDoc, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useErrorHandler } from "react-error-boundary"
import { useCollection } from "react-firebase-hooks/firestore"

import type { FC } from "react"

const { Meta } = Card

import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import { InviteConverter } from "~/types/db/Products/Invites"
import { MemberConverter } from "~/types/db/Products/Members"
import { auth, db } from "~/utils/firebase"
import { dbAdmin } from "~/utils/firebaseAdmin"
import { trpc } from "~/utils/trpc"

const TeamSettingsClientPage: FC = () => {
	const { product } = useAppContext()

	const inviteUser = trpc.product.inviteUser.useMutation()
	const inviteReminder = trpc.product.inviteReminder.useMutation()

	const [currentTab, setcurrentTab] = useState<`editor` | `viewer`>(`editor`)

	const [members, , membersError] = useCollection(collection(product.ref, `Members`).withConverter(MemberConverter))
	useErrorHandler(membersError)

	//const [invitees, , inviteesError] = useCollection(collection(product.ref, `Invites`).withConverter(InviteConverter))
	const [invitees, , inviteesError] = useCollection(collection(db, `Invites`).withConverter(InviteConverter))
	useErrorHandler(inviteesError)

	const [token, setToken] = useState<string | undefined>(undefined)

	const [email, setEmail] = useState(``)
	const [addNew, setAddNew] = useState(false)

	useEffect(() => {
		auth.currentUser?.getIdToken().then(setToken).catch(console.error)
	}, [])

	const memberEmails = trpc.product.getMemberEmails.useQuery(
		{ productId: product.id, userIdToken: token! },
		{ enabled: !!token },
	)

	const checkMemberExists = async (email: string) => {
		const userRef = collection(db, `Users`)
		const q = query(userRef, where(`email`, `==`, email), limit(1))
		const usersSnapshot = await getDocs(q)

		if (usersSnapshot.empty) {
			// User doesn't exist with this email, so they can't be a member
			return false
		}

		// User exists, so check if their ID exists in the Members subcollection
		const userId = usersSnapshot.docs[0]?.id
		const productsRef = collection(db, `Products`)
		const membersRef = collection(doc(productsRef, product.id), `Members`)
		const memberRef = doc(membersRef, userId)
		const memberSnapshot = await getDoc(memberRef)

		return memberSnapshot.exists()
	}

	const removeMember = async (id: string) => {
		const memberRef = collection(product.ref, `Members`)

		await deleteDoc(doc(memberRef, id))
	}

	const removeInvitee = async (id: string) => {
		const invitesRef = collection(db, `Invites`)

		await deleteDoc(doc(invitesRef, id));
	}

	const sendInvite = async () => {
		if (!token) return
		if (email === ``) return

		// const check = await checkMemberExists(email)

		try {
			await inviteUser.mutateAsync({
				email,
				productId: product.id,
				userIdToken: token,
				userType: currentTab,
			})
			setAddNew(false)
			setEmail(``)
			notification.success({
				message: `Invite sent`,
				placement: `topRight`,
			})
		} catch (error) {
			console.error(error)
		}
	}

	const sendReminder = async (email: string) => {
		if (!token) return
		try {
			await inviteReminder.mutateAsync({
				email,
				productId: product.id,
				userIdToken: token,
			})
			notification.success({
				message: `Invite sent`,
				placement: `topRight`,
			})
		} catch (error) {
			console.error(error)
		}
	}

	return (
		<div className="flex flex-col gap-6 px-12 py-8">
			<Breadcrumb items={[{ title: `Settings` }, { title: `Team` }]} />
			<Tabs
				activeKey={currentTab}
				onChange={(key) => setcurrentTab(key as `editor` | `viewer`)}
				tabBarExtraContent={
					<Dropdown
						trigger={[`click`]}
						menu={{
							items: [
								{
									label: `Member`,
									key: `member`,
									icon: <EditOutlined />,
									onClick: () => {
										setcurrentTab(`editor`)
										setAddNew(true)
									},
								},
								// {
								// 	label: `Viewer`,
								// 	key: `viewer`,
								// 	icon: <EyeOutlined />,
								// 	onClick: () => {
								// 		setcurrentTab(`viewer`)
								// 		setAddNew(true)
								// 	},
								// },
							],
						}}
					>
						<Button>
							<Space>
								Add Users
								<DownOutlined />
							</Space>
						</Button>
					</Dropdown>
				}
				items={[
					{
						label: `Members`,
						key: `editor`,
						children: (
							<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
								{members?.docs
									.filter((member) => member.data().type === `owner`)
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
															<Tag className="text-sm font-normal">Owner</Tag>
														</div>
													}
													description={memberEmails.data?.[member.id]}
												/>
												<Avatar size="small" style={{ backgroundColor: `#DDE3D5`, color: `rgba(0, 0, 0, 0.88)` }}>
													{i + 1}
												</Avatar>
											</div>
										</Card>
									))}

								{members?.docs
									.filter((member) => member.data().type === `editor`)
									.map((member, i) => (
										<Card
											key={member.id}
											actions={[
												<div
													key="setting"
													className="space-x-[10px]"
													onClick={() => {
														removeMember(member.id).catch(console.error)
													}}
												>
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
												<Avatar size="small" style={{ backgroundColor: `#DDE3D5`, color: `rgba(0, 0, 0, 0.88)` }}>
													{i + 2}
												</Avatar>
											</div>
										</Card>
									))}

								{invitees?.docs
									.filter((invitee) => invitee.data().userType === `editor` && invitee.data().productId === product.data().id && invitee.data().status === `pending`)
									.map((invitee) => (
										<Card
											key={invitee.id}
											actions={[
												<div
													key="setting"
													className="space-x-[10px]"
													onClick={() => {
														removeInvitee(invitee.id).catch(console.error)
													}}
												>
													<span>
														<DeleteOutlined />
													</span>
													{` `}
													<span>Remove</span>
												</div>,
												<div key="reminder" className="px-2">
													<Button
														icon={<SendOutlined />}
														block
														className="flex items-center justify-center"
														onClick={() => {
															sendReminder(invitee.data().email).catch(console.error)
														}}
													>
														Send Reminder
													</Button>
												</div>,
											]}
										>
											<div className="flex items-center justify-between">
												<Meta
													avatar={<Avatar shape="square" icon={<UserOutlined />} />}
													title={
														<Tag className="capitalize" color="orange">
															{invitee.data().status}
														</Tag>
													}
													description={
														<div className="space-x-1">
															<span>{invitee.data().email}</span>
														</div>
													}
												/>
											</div>
										</Card>
									))}

								{addNew && (
									<Card
										actions={[
											<div
												key="setting"
												className="space-x-[10px]"
												onClick={() => {
													setEmail(``)
													setAddNew(false)
												}}
											>
												<span>
													<DeleteOutlined />
												</span>
												{` `}
												<span>Remove</span>
											</div>,
											<div key="invite" className="px-2">
												<Button
													icon={<SendOutlined />}
													block
													className="flex items-center justify-center"
													onClick={() => {
														sendInvite().catch(console.error)
													}}
												>
													Invite
												</Button>
											</div>,
										]}
									>
										<div className="flex items-center justify-between gap-2">
											<div className="flex-1">
												<Input
													prefix="Email"
													className="w-full"
													value={email}
													onChange={(e) => setEmail(e.target.value)}
												/>
											</div>
											<Avatar size="small" style={{ backgroundColor: `#DDE3D5`, color: `rgba(0, 0, 0, 0.88)` }}>
												#
											</Avatar>
										</div>
									</Card>
								)}
							</div>
						),
					},
					// {
					// 	label: `Viewers`,
					// 	key: `viewer`,
					// 	children: (
					// 		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
					// 			{members?.docs
					// 				.filter((member) => member.data().type === `viewer`)
					// 				.map((member, i) => (
					// 					<Card
					// 						key={member.id}
					// 						actions={[
					// 							<div
					// 								key="setting"
					// 								className="space-x-[10px]"
					// 								onClick={() => {
					// 									removeMember(member.id).catch(console.error)
					// 								}}
					// 							>
					// 								<span>
					// 									<DeleteOutlined />
					// 								</span>
					// 								{` `}
					// 								<span>Remove</span>
					// 							</div>,
					// 						]}
					// 					>
					// 						<div className="flex items-center justify-between">
					// 							<Meta
					// 								avatar={<Avatar shape="square" src={member.data().avatar} />}
					// 								title={
					// 									<div className="space-x-1">
					// 										<span className="capitalize">{member.data().name}</span>
					// 									</div>
					// 								}
					// 								description={memberEmails.data?.[member.id]}
					// 							/>
					// 							<Avatar size="small" style={{ backgroundColor: `#DDE3D5`, color: `rgba(0, 0, 0, 0.88)` }}>
					// 								{i + 1}
					// 							</Avatar>
					// 						</div>
					// 					</Card>
					// 				))}

					// 			{invitees?.docs
					// 				.filter((invitee) => invitee.data().userType === `viewer` && invitee.data().status === `pending`)
					// 				.map((invitee) => (
					// 					<Card
					// 						key={invitee.id}
					// 						actions={[
					// 							<div
					// 								key="setting"
					// 								className="space-x-[10px]"
					// 								onClick={() => {
					// 									removeInvitee(invitee.id).catch(console.error)
					// 								}}
					// 							>
					// 								<span>
					// 									<DeleteOutlined />
					// 								</span>
					// 								{` `}
					// 								<span>Remove</span>
					// 							</div>,
					// 							<div key="reminder" className="px-2">
					// 								<Button
					// 									icon={<SendOutlined />}
					// 									block
					// 									className="flex items-center justify-center"
					// 									onClick={() => {
					// 										sendReminder(invitee.data().email).catch(console.error)
					// 									}}
					// 								>
					// 									Send Reminder
					// 								</Button>
					// 							</div>,
					// 						]}
					// 					>
					// 						<div className="flex items-center justify-between">
					// 							<Meta
					// 								avatar={<Avatar shape="square" icon={<UserOutlined />} />}
					// 								title={
					// 									<Tag className="capitalize" color="orange">
					// 										{invitee.data().status}
					// 									</Tag>
					// 								}
					// 								description={
					// 									<div className="space-x-1">
					// 										<span>{invitee.data().email}</span>
					// 									</div>
					// 								}
					// 							/>
					// 						</div>
					// 					</Card>
					// 				))}

					// 			{addNew && (
					// 				<Card
					// 					actions={[
					// 						<div
					// 							key="setting"
					// 							className="space-x-[10px]"
					// 							onClick={() => {
					// 								setEmail(``)
					// 								setAddNew(false)
					// 							}}
					// 						>
					// 							<span>
					// 								<DeleteOutlined />
					// 							</span>
					// 							{` `}
					// 							<span>Remove</span>
					// 						</div>,
					// 						<div key="invite" className="px-2">
					// 							<Button
					// 								icon={<SendOutlined />}
					// 								block
					// 								className="flex items-center justify-center"
					// 								onClick={() => {
					// 									sendInvite().catch(console.error)
					// 								}}
					// 							>
					// 								Invite
					// 							</Button>
					// 						</div>,
					// 					]}
					// 				>
					// 					<div className="flex items-center justify-between gap-2">
					// 						<div className="flex-1">
					// 							<Input
					// 								prefix="Email"
					// 								className="w-full"
					// 								value={email}
					// 								onChange={(e) => setEmail(e.target.value)}
					// 							/>
					// 						</div>
					// 						<Avatar size="small" style={{ backgroundColor: `#DDE3D5`, color: `rgba(0, 0, 0, 0.88)` }}>
					// 							#
					// 						</Avatar>
					// 					</div>
					// 				</Card>
					// 			)}
					// 		</div>
					// 	),
					// },
				]}
			/>
		</div>
	)
}

export default TeamSettingsClientPage
