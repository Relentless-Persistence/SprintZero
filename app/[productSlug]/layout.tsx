"use client"

import {CloseOutlined} from "@ant-design/icons"
import {useQuery} from "@tanstack/react-query"
import {Avatar, Drawer, Layout, Menu} from "antd5"
import {doc, onSnapshot} from "firebase9/firestore"
import {useSetAtom} from "jotai"
import Image from "next/image"
import {useEffect, useState} from "react"

import type {ReactNode, FC} from "react"

import SettingsMenu from "./SettingsMenu"
import SideMenu from "./SideMenu"
import LinkTo from "~/components/LinkTo"
import {db} from "~/config/firebase"
import {Products, ProductSchema} from "~/types/db/Products"
import {getProductsByUser, getUser} from "~/utils/api/queries"
import {activeProductAtom, useUserId} from "~/utils/atoms"
import {useActiveProductId} from "~/utils/useActiveProductId"

export type DashboardLayoutProps = {
	children: ReactNode
}

const DashboardLayout: FC<DashboardLayoutProps> = ({children}) => {
	const userId = useUserId()

	const {data: user} = useQuery({
		queryKey: [`user`, userId],
		queryFn: getUser(userId!),
		enabled: userId !== undefined,
	})
	const {data: products} = useQuery({
		queryKey: [`all-products`, user?.id],
		// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
		queryFn: getProductsByUser(user?.id!),
		enabled: user?.id !== undefined,
	})

	const activeProductId = useActiveProductId()
	const setActiveProduct = useSetAtom(activeProductAtom)
	useEffect(() => {
		if (!activeProductId) return

		return onSnapshot(doc(db, Products._, activeProductId), (doc) => {
			const data = ProductSchema.parse({id: doc.id, ...doc.data()})
			setActiveProduct(data)
		})
	}, [activeProductId, setActiveProduct])

	const [isSettingsOpen, setIsSettingsOpen] = useState(false)

	return (
		<Layout className="h-full">
			<Layout.Header style={{paddingInline: `unset`}}>
				<div id="dashboard" className="flex h-full items-center gap-8 bg-pine px-[17.45px]">
					<Image src="/images/logo_beta.png" alt="SprintZero logo" width={178} height={42} priority />

					<Menu
						theme="dark"
						mode="horizontal"
						selectedKeys={activeProductId ? [activeProductId] : []}
						items={products?.map((product) => ({
							key: product.id,
							label: (
								<LinkTo href={`/${product.id}/dashboard`} className="relative">
									{product.name}
								</LinkTo>
							),
						}))}
						className="grow [&>.ant-menu-item-selected]:shadow-[inset_0px_-4px_0px_0px_#73c92d]"
						style={{background: `transparent`}}
					/>

					<button type="button" onClick={() => void setIsSettingsOpen(true)}>
						<Avatar src={user?.avatar} className="border-2 border-green" />
					</button>
				</div>
			</Layout.Header>
			<Layout className="bg-[#f0f2f5]" style={{flexDirection: `row`}}>
				<Layout.Sider theme="light">
					<SideMenu />
				</Layout.Sider>
				<Layout.Content className="relative">{children}</Layout.Content>
			</Layout>

			<Drawer
				title="Settings"
				closable={false}
				width="192px"
				open={isSettingsOpen}
				onClose={() => void setIsSettingsOpen(false)}
				extra={
					<button type="button" onClick={() => void setIsSettingsOpen(false)}>
						<CloseOutlined />
					</button>
				}
				bodyStyle={{padding: `12px`}}
			>
				<SettingsMenu />
			</Drawer>
		</Layout>
	)
}

export default DashboardLayout
