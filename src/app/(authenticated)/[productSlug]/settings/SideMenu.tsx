"use client"

import {SettingOutlined, TeamOutlined} from "@ant-design/icons"
import {Menu} from "antd"
import {usePathname} from "next/navigation"
import {useState} from "react"

import type {ItemType} from "antd/es/menu/hooks/useItems"
import type {FC} from "react"
import type {Id} from "~/types"

import LinkTo from "~/components/LinkTo"
import {useActiveProductId} from "~/utils/useActiveProductId"

const getItems = (activeProductId: Id): ItemType[] => [
	{
		key: `configuration`,
		icon: <SettingOutlined />,
		label: <LinkTo href={`/${activeProductId}/settings/configuration`}>Configuration</LinkTo>,
	},
	{
		key: `team`,
		icon: <TeamOutlined />,
		label: <LinkTo href={`/${activeProductId}/settings/team`}>Team</LinkTo>,
	},
]

const SideMenu: FC = () => {
	const pathname = usePathname()
	const activeProductId = useActiveProductId()

	const items = getItems(activeProductId)
	const [openKey, setOpenKey] = useState(
		items.find((item) => item?.key === pathname?.split(`/`).at(-1))?.key as string | undefined,
	)

	return (
		<Menu
			mode="inline"
			onOpenChange={(openKeys) => setOpenKey(openKeys.find((key) => key !== openKey))}
			selectedKeys={[
				(items.find((item) => item?.key === pathname?.split(`/`).at(-1))?.key as string | undefined) ?? ``,
			]}
			items={items}
			className="h-full"
		/>
	)
}

export default SideMenu
