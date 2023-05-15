"use client"

import { Layout } from "antd"
import { useAuthState } from "react-firebase-hooks/auth"
import invariant from "tiny-invariant"

import type { FC, ReactNode } from "react"

import SideMenu from "./SideMenu"
import { auth } from "~/utils/firebase"

export type DashboardLayoutProps = {
	children: ReactNode
}

const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
	const [user] = useAuthState(auth)
	invariant(user, `User must be logged in.`)

	return (
		<>
			<Layout.Sider theme="light">
				<SideMenu />
			</Layout.Sider>
			<Layout.Content className="relative">{children}</Layout.Content>
		</>
	)
}

export default DashboardLayout
