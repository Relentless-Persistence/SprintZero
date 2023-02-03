"use client"

import {Breadcrumb} from "antd"

import type {FC} from "react"

const ConfigSettingsPage: FC = () => {
	return (
		<div className="px-12 py-8">
			<Breadcrumb>
				<Breadcrumb.Item>Settings</Breadcrumb.Item>
				<Breadcrumb.Item>Config</Breadcrumb.Item>
			</Breadcrumb>
		</div>
	)
}

export default ConfigSettingsPage
