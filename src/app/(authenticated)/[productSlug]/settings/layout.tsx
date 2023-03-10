"use client"

import {Layout} from "antd"
import {useRouter} from "next/navigation"
import {useEffect, useState} from "react"

import type {FC, ReactNode} from "react"

import SideMenu from "./SideMenu"
import {useAppContext} from "../AppContext"

export type SettingsLayoutProps = {
	children: ReactNode
}

const SettingsLayout: FC<SettingsLayoutProps> = ({children}) => {
	const {product, user} = useAppContext()
	const router = useRouter()

	const [isOwner, setIsOwner] = useState(false)

	useEffect(() => {
		if (Object.entries(product.data().members).find(([userId]) => userId === user.id)?.[1]?.type === `owner`) {
			setIsOwner(true)
		} else {
			router.replace(`/404`)
		}
	}, [product, router, user])

	if (!isOwner) return null
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
