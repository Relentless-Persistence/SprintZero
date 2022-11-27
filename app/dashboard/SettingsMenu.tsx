import {
	ApiOutlined,
	DollarOutlined,
	FormOutlined,
	LogoutOutlined,
	SettingOutlined,
	TeamOutlined,
	UserOutlined,
} from "@ant-design/icons"
import {Menu} from "antd5"
import Link from "next/link"
import {usePathname} from "next/navigation"

import type {ReactElement} from "react"

import {auth} from "~/config/firebase"

const SettingsMenu = (): ReactElement | null => {
	const pathname = usePathname()

	return (
		<div className="flex h-full flex-col justify-between">
			<Menu
				selectedKeys={[`settings-${(pathname ?? ``).split(`/`).at(-1)}`]}
				items={[
					{
						key: `settings-account`,
						icon: <UserOutlined />,
						label: <Link href="/dashboard/settings/account">Account</Link>,
					},
					{
						key: `settings-billing`,
						icon: <DollarOutlined />,
						label: <Link href="/dashboard/settings/billing">Billing</Link>,
					},
					{
						key: `settings-config`,
						icon: <SettingOutlined />,
						label: <Link href="/dashboard/settings/config">Configuration</Link>,
					},
					{key: `settings-team`, icon: <TeamOutlined />, label: <Link href="/dashboard/settings/team">Team</Link>},
					{
						key: `settings-integrations`,
						icon: <ApiOutlined />,
						label: <Link href="/dashboard/settings/integrations">Integrations</Link>,
					},
				]}
				style={{borderInlineEnd: `unset`}}
			/>
			<Menu
				items={[
					{
						key: `settings-support`,
						icon: <FormOutlined />,
						label: <Link href="/dashboard/settings/support">Support</Link>,
					},
					{
						key: `settings-logout`,
						icon: <LogoutOutlined />,
						label: `Logout`,
						onClick: () => void auth.signOut(),
					},
				]}
				style={{borderInlineEnd: `unset`}}
			/>
		</div>
	)
}

export default SettingsMenu
