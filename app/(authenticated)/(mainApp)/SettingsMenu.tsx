"use client"

import {FormOutlined, LogoutOutlined, SettingOutlined, TeamOutlined, UserOutlined} from "@ant-design/icons"
import {Menu} from "antd"
import {usePathname} from "next/navigation"

import type {FC} from "react"

import LinkTo from "~/components/LinkTo"

export type SettingsMenuProps = {
	onClose: () => void
}

const SettingsMenu: FC<SettingsMenuProps> = ({onClose}) => {
	const pathname = usePathname()

	return (
		<div className="flex h-full flex-col justify-between">
			<Menu
				selectedKeys={[`settings-${(pathname ?? ``).split(`/`).at(-1)!}`]}
				items={[
					{
						key: `settings-account`,
						icon: <UserOutlined />,
						label: <LinkTo href="/settings/account">Account</LinkTo>,
						onClick: () => onClose(),
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
						onClick: () => onClose(),
					},
					{
						key: `settings-sign-out`,
						icon: <LogoutOutlined />,
						label: <LinkTo href="/sign-out">Sign out</LinkTo>,
						onClick: () => onClose(),
					},
				]}
				style={{borderInlineEnd: `unset`}}
			/>
		</div>
	)
}

export default SettingsMenu
