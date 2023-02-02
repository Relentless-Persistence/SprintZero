"use client"

import {Layout} from "antd"

import type {FC, ReactNode} from "react"

import Header from "./Header"
import SideMenu from "./SideMenu"

export type MainAppLayoutProps = {
	children: ReactNode
}

const MainAppLayout: FC<MainAppLayoutProps> = ({children}) => {
	return (
		<Layout className="h-full">
			<Header />
			<Layout className="bg-[#f0f2f5]" style={{flexDirection: `row`}}>
				<Layout.Sider theme="light">
					<SideMenu />
				</Layout.Sider>
				<Layout.Content className="relative">{children}</Layout.Content>
			</Layout>
		</Layout>
	)
}

export default MainAppLayout
