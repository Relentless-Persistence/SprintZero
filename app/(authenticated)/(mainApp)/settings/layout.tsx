"use client"

import {Tabs} from "antd"
import {usePathname} from "next/navigation"

import type {FC, ReactNode} from "react"

import LinkTo from "~/components/LinkTo"

export type SettingsLayoutProps = {
	children: ReactNode
}

const SettingsLayout: FC<SettingsLayoutProps> = ({children}) => {
	const pathname = usePathname()

	return (
		<div className="grid h-full grid-cols-[1fr_max-content] gap-8">
			<div>{children}</div>
			<Tabs
				tabPosition="right"
				activeKey={pathname?.split(`/`)[2]}
				items={[
					{key: `account`, label: <LinkTo href="/settings/account">Account</LinkTo>},
					{key: `config`, label: <LinkTo href="/settings/config">Config</LinkTo>},
					{key: `team`, label: <LinkTo href="/settings/team">Team</LinkTo>},
				]}
			/>
		</div>
	)
}

export default SettingsLayout
