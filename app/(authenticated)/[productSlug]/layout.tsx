"use client"

import {Layout} from "antd"

import type {FC, ReactNode} from "react"

import Header from "./Header"

export type MainAppLayoutProps = {
	children: ReactNode
}

const MainAppLayout: FC<MainAppLayoutProps> = ({children}) => {
	return (
		<Layout className="h-full">
			<Header />
			<Layout>{children}</Layout>
		</Layout>
	)
}

export default MainAppLayout
