"use client"

import {Breadcrumb} from "antd"

import type {FC} from "react"

const TeamSettingsPage: FC = () => {
	return (
		<div className="px-12 py-8">
			<Breadcrumb>
				<Breadcrumb.Item>Settings</Breadcrumb.Item>
				<Breadcrumb.Item>Team</Breadcrumb.Item>
			</Breadcrumb>
		</div>
	)
}

export default TeamSettingsPage
