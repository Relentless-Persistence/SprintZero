"use client"

import {
	DeploymentUnitOutlined,
	HomeOutlined,
	NodeExpandOutlined,
	PullRequestOutlined,
	UserOutlined,
} from "@ant-design/icons"
import {Menu} from "antd5"
import Link from "next/link"
import {usePathname} from "next/navigation"
import {useState} from "react"

import type {FC} from "react"

import {useActiveProductId} from "~/utils/useActiveProductId"

const SideMenu: FC = () => {
	const pathname = usePathname()
	const activeProductId = useActiveProductId()
	const [openKeys, setOpenKeys] = useState<string[]>([])

	return (
		<>
			{activeProductId && (
				<Menu
					mode="inline"
					openKeys={openKeys}
					selectedKeys={[`sidemenu-${(pathname ?? ``).split(`/`).at(-1)}`]}
					items={[
						{
							key: `sidemenu-dashboard`,
							icon: <HomeOutlined />,
							label: <Link href={`/${activeProductId}/dashboard`}>Home</Link>,
						},
						{
							key: `sidemenu-strategy`,
							icon: <DeploymentUnitOutlined />,
							label: `Strategy`,
							children: [
								{
									key: `sidemenu-kickoff`,
									label: <Link href={`/${activeProductId}/strategy/kickoff`}>Kickoff</Link>,
								},
								{
									key: `sidemenu-accessibility`,
									label: <Link href={`/${activeProductId}/strategy/accessibility`}>Accessibility</Link>,
								},
								{
									key: `sidemenu-objectives`,
									label: <Link href={`/${activeProductId}/strategy/objectives`}>Objectives</Link>,
								},
								{
									key: `sidemenu-vision`,
									label: <Link href={`/${activeProductId}/strategy/vision`}>Vision</Link>,
								},
							],
						},
						{
							key: `sidemenu-tactics`,
							icon: <PullRequestOutlined />,
							label: `Tactics`,
							children: [
								{
									key: `sidemenu-ethics`,
									label: <Link href={`/${activeProductId}/tactics/ethics`}>Ethics</Link>,
								},
								{
									key: `sidemenu-priorities`,
									label: <Link href={`/${activeProductId}/tactics/priorities`}>Priorities</Link>,
								},
								{
									key: `sidemenu-retrospective`,
									label: <Link href={`/${activeProductId}/tactics/retrospective`}>Retrospective</Link>,
								},
							],
						},
						{
							key: `sidemenu-operations`,
							icon: <NodeExpandOutlined />,
							label: `Operations`,
							children: [
								{
									key: `sidemenu-huddle`,
									label: <Link href={`/${activeProductId}/operations/huddle`}>Huddle</Link>,
								},
								{
									key: `sidemenu-sprint`,
									label: <Link href={`/${activeProductId}/operations/sprint`}>Sprint</Link>,
								},
								{
									key: `sidemenu-tasks`,
									label: <Link href={`/${activeProductId}/operations/tasks`}>Tasks</Link>,
								},
							],
						},
						{
							key: `sidemenu-userbase`,
							icon: <UserOutlined />,
							label: `Userbase`,
							children: [
								{
									key: `sidemenu-dialogue`,
									label: <Link href={`/${activeProductId}/userbase/dialogue`}>Dialogue</Link>,
								},
								{
									key: `sidemenu-journeys`,
									label: <Link href={`/${activeProductId}/userbase/journeys`}>Journeys</Link>,
								},
								{
									key: `sidemenu-learnings`,
									label: <Link href={`/${activeProductId}/userbase/learnings`}>Learnings</Link>,
								},
								{
									key: `sidemenu-personas`,
									label: <Link href={`/${activeProductId}/userbase/personas`}>Personas</Link>,
								},
							],
						},
					]}
					onOpenChange={(keys) => {
						setOpenKeys(keys.slice(-1))
					}}
					style={{borderInlineEnd: `unset`}}
				/>
			)}
		</>
	)
}

export default SideMenu
