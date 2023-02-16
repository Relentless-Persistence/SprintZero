"use client"

import {Avatar, Breadcrumb, Input} from "antd"

import type {FC} from "react"

import {useUser} from "~/utils/useUser"

const AccountSettingsPage: FC = () => {
	const user = useUser()

	return (
		<div className="flex flex-col gap-6 px-12 py-8">
			<Breadcrumb>
				<Breadcrumb.Item>Settings</Breadcrumb.Item>
				<Breadcrumb.Item>Account</Breadcrumb.Item>
			</Breadcrumb>

			<div className="flex gap-8">
				<div className="flex grow flex-col gap-4">
					<p className="text-lg font-semibold">Personal Details</p>
					<div className="grid grid-cols-[auto_1fr] items-center gap-4">
						<p>Full Name:</p>
						<Input disabled value={user?.data().name} />
						<p>Linked Account:</p>
						<Input disabled value={user?.data().email} />
					</div>
				</div>
				<div className="flex flex-col gap-4">
					<p className="text-lg font-semibold">Avatar</p>
					<Avatar src={user?.data().avatar} className="h-20 w-20" />
				</div>
			</div>
		</div>
	)
}

export default AccountSettingsPage
