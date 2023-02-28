"use client"

import {Layout} from "antd"

import type {FC, ReactNode} from "react"

import SideMenu from "./SideMenu"

export type SettingsLayoutProps = {
	children: ReactNode
}

const SettingsLayout: FC<SettingsLayoutProps> = ({children}) => {
	return (
		<>
			<Layout.Sider theme="light">
				<SideMenu />
			</Layout.Sider>
			<Layout.Content className="relative">{children}</Layout.Content>
		</>
	)
}

export default SettingsLayout
