"use client"

import {
	DeploymentUnitOutlined,
	HomeOutlined,
	NodeExpandOutlined,
	PullRequestOutlined,
	UserOutlined,
} from "@ant-design/icons"
import {Menu} from "antd"
import Link from "next/link"
import {usePathname} from "next/navigation"
import {useState} from "react"

import type {FC} from "react"
import type {Id} from "~/types"

import {useActiveProductId} from "~/utils/useActiveProductId"

const getItems = (activeProductId: Id) => [
	{
		key: `dashboard`,
		icon: <HomeOutlined />,
		label: <Link href={`/${activeProductId}/dashboard`}>Home</Link>,
	},
	{
		key: `strategy`,
		icon: <DeploymentUnitOutlined />,
		label: `Strategy`,
		children: [
			{
				key: `strategy/kickoff`,
				label: <Link href={`/${activeProductId}/strategy/kickoff`}>Kickoff</Link>,
			},
			{
				key: `strategy/accessibility`,
				label: <Link href={`/${activeProductId}/strategy/accessibility`}>Accessibility</Link>,
			},
			{
				key: `strategy/objectives`,
				label: <Link href={`/${activeProductId}/strategy/objectives`}>Objectives</Link>,
			},
			{
				key: `strategy/vision`,
				label: <Link href={`/${activeProductId}/strategy/vision`}>Vision</Link>,
			},
		],
	},
	{
		key: `tactics`,
		icon: <PullRequestOutlined />,
		label: `Tactics`,
		children: [
			{
				key: `tactics/ethics`,
				label: <Link href={`/${activeProductId}/tactics/ethics`}>Ethics</Link>,
			},
			{
				key: `tactics/priorities`,
				label: <Link href={`/${activeProductId}/tactics/priorities`}>Priorities</Link>,
			},
			{
				key: `tactics/retrospective`,
				label: <Link href={`/${activeProductId}/tactics/retrospective`}>Retrospective</Link>,
			},
		],
	},
	{
		key: `operations`,
		icon: <NodeExpandOutlined />,
		label: `Operations`,
		children: [
			{
				key: `operations/huddle`,
				label: <Link href={`/${activeProductId}/operations/huddle`}>Huddle</Link>,
			},
			{
				key: `operations/sprint`,
				label: <Link href={`/${activeProductId}/operations/sprint`}>Sprint</Link>,
			},
			{
				key: `operations/tasks`,
				label: <Link href={`/${activeProductId}/operations/tasks`}>Tasks</Link>,
			},
		],
	},
	{
		key: `userbase`,
		icon: <UserOutlined />,
		label: `Userbase`,
		children: [
			{
				key: `userbase/dialogue`,
				label: <Link href={`/${activeProductId}/userbase/dialogue`}>Dialogue</Link>,
			},
			{
				key: `userbase/journeys`,
				label: <Link href={`/${activeProductId}/userbase/journeys`}>Journeys</Link>,
			},
			{
				key: `userbase/learnings`,
				label: <Link href={`/${activeProductId}/userbase/learnings`}>Learnings</Link>,
			},
			{
				key: `userbase/personas`,
				label: <Link href={`/${activeProductId}/userbase/personas`}>Personas</Link>,
			},
		],
	},
]

const SideMenu: FC = () => {
	const pathname = usePathname()
	const activeProductId = useActiveProductId()

	const items = getItems(activeProductId)
	const [openKey, setOpenKey] = useState<string | undefined>(
		items.find((item) => item.children?.find((child) => child.key === pathname?.replace(/^\/[^/]+\//, ``)))?.key,
	)

	return (
		<Menu
			mode="inline"
			openKeys={openKey ? [openKey] : []}
			onOpenChange={(openKeys) => void setOpenKey(openKeys.find((key) => key !== openKey))}
			selectedKeys={[pathname?.replace(/^\/[^/]+\//, ``) ?? ``]}
			items={items}
		/>
	)
}

export default SideMenu
