"use client"

import {SettingOutlined, TeamOutlined} from "@ant-design/icons"
import {Menu} from "antd"
import {usePathname} from "next/navigation"
import {useState} from "react"

import type {ItemType} from "antd/es/menu/hooks/useItems"
import type {FC} from "react"

import {useAppContext} from "../AppContext"
import LinkTo from "~/components/LinkTo"

const getItems = (activeProductId: string): ItemType[] => [
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
	const {product} = useAppContext()

	const items = getItems(product.id)
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
			className="h-full !shadow-[0px_0px_12px_rgb(0_0_0/0.04)]"
		/>
	)
}

export default SideMenu
