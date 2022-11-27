"use client"

import {CloseOutlined} from "@ant-design/icons"
import {useQuery} from "@tanstack/react-query"
import {Avatar, Drawer, Layout, Menu} from "antd5"
import Image from "next/image"
import {useState} from "react"

import type {ReactElement, ReactNode} from "react"

import SettingsMenu from "~/app/dashboard/SettingsMenu"
import SideMenu from "~/app/dashboard/SideMenu"
import useMainStore from "~/stores/mainStore"
import {getAllProducts} from "~/utils/fetch"

type Props = {
	children: ReactNode
}

const DashboardLayout = ({children}: Props): ReactElement | null => {
	const user = useMainStore((state) => state.user)
	const {data: products} = useQuery({
		queryKey: [`allProducts`, user?.uid],
		queryFn: getAllProducts(user?.uid),
		enabled: user?.uid !== undefined,
	})

	const setActiveProductId = useMainStore((state) => state.setActiveProductId)
	const activeProductId = useMainStore((state) => state.activeProductId)

	const [isSettingsOpen, setIsSettingsOpen] = useState(false)

	return (
		<Layout className="h-full">
			<Layout.Header style={{paddingInline: `unset`}}>
				<div className="flex h-full items-center gap-8 bg-pine px-[17.45px]">
					<Image src="/images/logo_beta.png" alt="SprintZero logo" width={178} height={42} priority />

					<Menu
						theme="dark"
						mode="horizontal"
						selectedKeys={activeProductId ? [activeProductId] : []}
						items={products?.map((product) => ({
							key: product.id,
							label: (
								<button type="button" onClick={() => void setActiveProductId(product.id)} className="relative">
									{product.product}
									{activeProductId === product.id && <div className="absolute left-0 bottom-0 h-1 w-full bg-green" />}
								</button>
							),
						}))}
						className="bg-transparent"
					/>

					<div className="grow" />

					<button type="button" onClick={() => void setIsSettingsOpen(true)}>
						<Avatar src={user?.photoURL} className="border-2 border-green" />
					</button>
				</div>
			</Layout.Header>
			<Layout className="bg-[#f0f2f5]" style={{flexDirection: `row`}}>
				<Layout.Sider theme="light">
					<SideMenu />
				</Layout.Sider>
				<Layout.Content>{children}</Layout.Content>
			</Layout>

			<Drawer
				title="Settings"
				closable={false}
				width="192px"
				open={isSettingsOpen}
				onClose={() => void setIsSettingsOpen(false)}
				extra={<CloseOutlined onClick={() => void setIsSettingsOpen(false)} />}
				bodyStyle={{padding: `12px`}}
			>
				<SettingsMenu />
			</Drawer>
		</Layout>
	)
}

export default DashboardLayout
