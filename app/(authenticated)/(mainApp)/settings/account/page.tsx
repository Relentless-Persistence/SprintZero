"use client"

import {Breadcrumb} from "antd"

import type {FC} from "react"

const AccountSettingsPage: FC = () => {
	return (
		<div className="px-12 py-8">
			<Breadcrumb>
				<Breadcrumb.Item>Settings</Breadcrumb.Item>
				<Breadcrumb.Item>Account</Breadcrumb.Item>
			</Breadcrumb>
		</div>
	)
}

export default AccountSettingsPage
