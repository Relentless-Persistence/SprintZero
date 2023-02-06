"use client"

import {
	DollarOutlined,
	FormOutlined,
	LogoutOutlined,
	SettingOutlined,
	TeamOutlined,
	UserOutlined,
} from "@ant-design/icons"
import {Menu} from "antd"
import {signOut} from "firebase/auth"
import Link from "next/link"
import {usePathname, useRouter} from "next/navigation"

import type {FC} from "react"

import {auth} from "~/utils/firebase"

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
						label: <Link href="/settings/account">Account</Link>,
					},
					{
						key: `settings-billing`,
						icon: <DollarOutlined />,
						label: <Link href="/settings/billing">Billing</Link>,
					},
					{
						key: `settings-config`,
						icon: <SettingOutlined />,
						label: <Link href="/settings/config">Configuration</Link>,
					},
					{key: `settings-team`, icon: <TeamOutlined />, label: <Link href="/settings/team">Team</Link>},
					// {
					// 	key: `settings-integrations`,
					// 	icon: <ApiOutlined />,
					// 	label: <Link href="/settings/integrations">Integrations</Link>,
					// },
				]}
				style={{borderInlineEnd: `unset`}}
			/>
			<Menu
				items={[
					{
						key: `settings-support`,
						icon: <FormOutlined />,
						label: (
							<Link href="https://www.sprintzero.app/contact" target="_blank">
								Support
							</Link>
						),
					},
					{
						key: `settings-logout`,
						icon: <LogoutOutlined />,
						label: `Logout`,
						onClick: async () => {
							await signOut(auth)
							router.push(`/sign-in`)
						},
					},
				]}
				style={{borderInlineEnd: `unset`}}
			/>
		</div>
	)
}

export default SettingsMenu
