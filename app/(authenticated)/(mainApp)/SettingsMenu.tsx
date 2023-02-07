"use client"

import {FormOutlined, LogoutOutlined, SettingOutlined, TeamOutlined, UserOutlined} from "@ant-design/icons"
import {Menu} from "antd"
import {usePathname, useRouter} from "next/navigation"

import type {FC} from "react"

import LinkTo from "~/components/LinkTo"

const SettingsMenu: FC = () => {
	const pathname = usePathname()
	const router = useRouter()

	return (
		<div className="flex h-full flex-col justify-between">
			<Menu
				selectedKeys={[`settings-${(pathname ?? ``).split(`/`).at(-1)}`]}
				items={[
					{
						key: `settings-account`,
						icon: <UserOutlined />,
						label: <LinkTo href="/settings/account">Account</LinkTo>,
					},
					{
						key: `settings-config`,
						icon: <SettingOutlined />,
						label: <LinkTo href="/settings/config">Configuration</LinkTo>,
					},
					{key: `settings-team`, icon: <TeamOutlined />, label: <LinkTo href="/settings/team">Team</LinkTo>},
				]}
				style={{borderInlineEnd: `unset`}}
			/>
			<Menu
				items={[
					{
						key: `settings-support`,
						icon: <FormOutlined />,
						label: (
							<LinkTo href="https://www.sprintzero.app/contact" openInNewTab>
								Support
							</LinkTo>
						),
					},
					{
						key: `settings-logout`,
						icon: <LogoutOutlined />,
						label: `Logout`,
						onClick: () => void router.push(`/sign-out`),
					},
				]}
				style={{borderInlineEnd: `unset`}}
			/>
		</div>
	)
}

export default SettingsMenu
