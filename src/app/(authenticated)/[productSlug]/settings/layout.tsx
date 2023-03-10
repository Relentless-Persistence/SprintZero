"use client"

import {SelectOutlined} from "@ant-design/icons"
import {Layout, Menu} from "antd"
import {collection} from "firebase/firestore"
import {useRouter} from "next/navigation"
import {useEffect, useState} from "react"
import {useCollection} from "react-firebase-hooks/firestore"

import type {FC, ReactNode} from "react"

import SideMenu from "./SideMenu"
import {useAppContext} from "../AppContext"
import LinkTo from "~/components/LinkTo"
import {MemberConverter} from "~/types/db/Products/Members"
import {conditionalThrow} from "~/utils/conditionalThrow"

export type SettingsLayoutProps = {
	children: ReactNode
}

const SettingsLayout: FC<SettingsLayoutProps> = ({children}) => {
	const {product, user} = useAppContext()
	const router = useRouter()

	const [members, , membersError] = useCollection(collection(product.ref, `Members`).withConverter(MemberConverter))
	conditionalThrow(membersError)

	const [isOwner, setIsOwner] = useState(false)

	useEffect(() => {
		if (!members) return
		if (members.docs.find((member) => member.id === user.id)!.data().type === `owner`) {
			setIsOwner(true)
		} else {
			router.replace(`/404`)
		}
	}, [members, router, user.id])

	if (!isOwner) return null
	return (
		<>
			<Layout.Sider theme="light">
				<div className="flex h-full flex-col justify-between">
					<SideMenu />
					<Menu
						items={[
							{
								key: `exit`,
								icon: <SelectOutlined />,
								label: <LinkTo href={`/${product.id}/map`}>Exit Settings</LinkTo>,
							},
						]}
						className="content-baseline"
					/>
				</div>
			</Layout.Sider>
			<Layout.Content className="relative">{children}</Layout.Content>
		</>
	)
}

export default SettingsLayout
