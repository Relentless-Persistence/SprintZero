"use client"

import {DeleteOutlined, EditOutlined, EyeOutlined, SendOutlined, UserAddOutlined, UserOutlined} from "@ant-design/icons"
import {Avatar, Breadcrumb, Button, Card, FloatButton, Input, Tabs, Tag, Tooltip, notification} from "antd"
import {collection, deleteDoc, doc} from "firebase/firestore"
import {useEffect, useState} from "react"
import {useErrorHandler} from "react-error-boundary"
import {useCollection} from "react-firebase-hooks/firestore"

import type {FC} from "react"

const {Meta} = Card

import {useAppContext} from "~/app/(authenticated)/[productSlug]/AppContext"
import {InviteConverter} from "~/types/db/Products/Invites"
import {MemberConverter} from "~/types/db/Products/Members"
import {auth} from "~/utils/firebase"
import {trpc} from "~/utils/trpc"

const TeamSettingsClientPage: FC = () => {
	const {product} = useAppContext()

	const inviteUser = trpc.product.inviteUser.useMutation()

	const [currentTab, setcurrentTab] = useState<`editor` | `viewer`>(`editor`)

	const [members, , membersError] = useCollection(collection(product.ref, `Members`).withConverter(MemberConverter))
	useErrorHandler(membersError)

	const [invitees, , inviteesError] = useCollection(collection(product.ref, `Invites`).withConverter(InviteConverter))
	useErrorHandler(inviteesError)

	const [token, setToken] = useState<string | undefined>(undefined)

	const [email, setEmail] = useState(``)
	const [addNew, setAddNew] = useState(false)

	useEffect(() => {
		auth.currentUser?.getIdToken().then(setToken).catch(console.error)
	}, [])

	const memberEmails = trpc.product.getMemberEmails.useQuery(
		{productId: product.id, userIdToken: token!},
		{enabled: !!token},
	)

	const removeMember = async (id: string) => {
		const memberRef = collection(product.ref, `Members`)

		await deleteDoc(doc(memberRef, id))
	}

	const removeInvitee = async (id: string) => {
		const invitesRef = collection(product.ref, `Invites`)

		await deleteDoc(doc(invitesRef, id))
	}

	const sendInvite = async () => {
		if (!token) return
		if (email === ``) return
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
							<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
								{members?.docs
									.filter((member) => member.data().type === `owner`)
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
															<Tag className="text-sm font-normal">Owner`</Tag>
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
												<Avatar size="small" style={{backgroundColor: `#DDE3D5`, color: `rgba(0, 0, 0, 0.88)`}}>
													{i + 2}
												</Avatar>
											</div>
										</Card>
									))}

								{invitees?.docs
									.filter((invitee) => invitee.data().userType === `editor`)
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
													<Button icon={<SendOutlined />} block className="flex items-center justify-center">
														Send Reminder
													</Button>
												</div>,
											]}
										>
											<div className="flex items-center justify-between">
												<Meta
													avatar={<Avatar shape="square" icon={<UserOutlined />} />}
													title={
														<div className="space-x-1">
															<span>{invitee.data().email}</span>
														</div>
													}
													description="."
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
											<Avatar size="small" style={{backgroundColor: `#DDE3D5`, color: `rgba(0, 0, 0, 0.88)`}}>
												#
											</Avatar>
										</div>
									</Card>
								)}
							</div>
						),
					},
					{
						label: `Viewers`,
						key: `viewer`,
						children: (
							<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
								{members?.docs
									.filter((member) => member.data().type === `viewer`)
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
												<Avatar size="small" style={{backgroundColor: `#DDE3D5`, color: `rgba(0, 0, 0, 0.88)`}}>
													{i + 1}
												</Avatar>
											</div>
										</Card>
									))}

								{invitees?.docs
									.filter((invitee) => invitee.data().userType === `viewer`)
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
													<Button icon={<SendOutlined />} block className="flex items-center justify-center">
														Send Reminder
													</Button>
												</div>,
											]}
										>
											<div className="flex items-center justify-between">
												<Meta
													avatar={<Avatar shape="square" src="" />}
													title={
														<div className="space-x-1">
															<span>{invitee.data().email}</span>
														</div>
													}
													description="."
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
											<Avatar size="small" style={{backgroundColor: `#DDE3D5`, color: `rgba(0, 0, 0, 0.88)`}}>
												#
											</Avatar>
										</div>
									</Card>
								)}
							</div>
						),
					},
				]}
			/>

			<Tooltip placement="left" title="Viewer">
				<FloatButton.Group trigger="click" type="primary" style={{right: 94}} icon={<UserAddOutlined />}>
					<Tooltip placement="left" title="Viewer">
						<FloatButton
							icon={<EyeOutlined />}
							onClick={() => {
								setcurrentTab(`viewer`)
								setAddNew(true)
							}}
						/>
					</Tooltip>
					<Tooltip placement="left" title="Member">
						<FloatButton
							icon={<EditOutlined />}
							onClick={() => {
								setcurrentTab(`editor`)
								setAddNew(true)
							}}
						/>
					</Tooltip>
				</FloatButton.Group>
			</Tooltip>
		</div>
	)
}

export default TeamSettingsClientPage
