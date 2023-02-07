"use client"

import {Breadcrumb, Tabs} from "antd"
import {useState} from "react"

import type {FC} from "react"

const tabNames = {
	validated: `Validated`,
	assumed: `Assumed`,
	disproven: `Disproven`,
} as const

const LearningsPage: FC = () => {
	const [currentTab, setCurrentTab] = useState<keyof typeof tabNames>(`validated`)

	return (
		<div className="grid grid-cols-[1fr_max-content]">
			<div className="overflow-auto px-12 py-8">
				<Breadcrumb>
					<Breadcrumb.Item>Userbase</Breadcrumb.Item>
					<Breadcrumb.Item>Learnings</Breadcrumb.Item>
					<Breadcrumb.Item>{tabNames[currentTab]}</Breadcrumb.Item>
				</Breadcrumb>
			</div>

			<Tabs
				tabPosition="right"
				activeKey={currentTab}
				onChange={(key: keyof typeof tabNames) => void setCurrentTab(key)}
				items={Object.entries(tabNames).map(([key, label]) => ({key, label}))}
			/>
		</div>
	)
}

export default LearningsPage
