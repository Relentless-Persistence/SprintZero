"use client"

import {
	ApartmentOutlined,
	DeploymentUnitOutlined,
	NodeExpandOutlined,
	PullRequestOutlined,
	UserOutlined,
} from "@ant-design/icons"
import {Menu} from "antd"
import {usePathname} from "next/navigation"
import {useState} from "react"

import type {FC} from "react"
import type {Id} from "~/types"

import LinkTo from "~/components/LinkTo"
import {useActiveProductId} from "~/utils/useActiveProductId"

const getItems = (activeProductId: Id) => [
	{
		key: `map`,
		icon: <ApartmentOutlined />,
		label: <LinkTo href={`/${activeProductId}/map`}>Story Map</LinkTo>,
	},
	{
		key: `strategy`,
		icon: <DeploymentUnitOutlined />,
		label: `Strategy`,
		children: [
			{
				key: `strategy/accessibility`,
				label: <LinkTo href={`/${activeProductId}/strategy/accessibility`}>Accessibility</LinkTo>,
			},
			{
				key: `strategy/kickoff`,
				label: <LinkTo href={`/${activeProductId}/strategy/kickoff`}>Kickoff</LinkTo>,
			},
			{
				key: `strategy/objectives`,
				label: <LinkTo href={`/${activeProductId}/strategy/objectives`}>Objectives</LinkTo>,
			},
			{
				key: `strategy/vision`,
				label: <LinkTo href={`/${activeProductId}/strategy/vision`}>Vision</LinkTo>,
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
				label: <LinkTo href={`/${activeProductId}/tactics/ethics`}>Ethics</LinkTo>,
			},
			{
				key: `tactics/priorities`,
				label: <LinkTo href={`/${activeProductId}/tactics/priorities`}>Priorities</LinkTo>,
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
				label: <LinkTo href={`/${activeProductId}/operations/huddle`}>Huddle</LinkTo>,
			},
			{
				key: `tactics/retrospective`,
				label: <LinkTo href={`/${activeProductId}/tactics/retrospective`}>Retrospective</LinkTo>,
			},
			{
				key: `operations/sprint`,
				label: <LinkTo href={`/${activeProductId}/operations/sprint`}>Sprint</LinkTo>,
			},
			{
				key: `operations/tasks`,
				label: <LinkTo href={`/${activeProductId}/operations/tasks`}>Tasks</LinkTo>,
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
				label: <LinkTo href={`/${activeProductId}/userbase/dialogue`}>Dialogue</LinkTo>,
			},
			{
				key: `userbase/journeys`,
				label: <LinkTo href={`/${activeProductId}/userbase/journeys`}>Journeys</LinkTo>,
			},
			{
				key: `userbase/insights`,
				label: <LinkTo href={`/${activeProductId}/userbase/insights`}>Insights</LinkTo>,
			},
			{
				key: `userbase/personas`,
				label: <LinkTo href={`/${activeProductId}/userbase/personas`}>Personas</LinkTo>,
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
			onOpenChange={(openKeys) => setOpenKey(openKeys.find((key) => key !== openKey))}
			selectedKeys={[pathname?.replace(/^\/[^/]+\//, ``) ?? ``]}
			items={items}
			className="h-full"
		/>
	)
}

export default SideMenu
