"use client"

import {CloseOutlined} from "@ant-design/icons"
import {useQuery} from "@tanstack/react-query"
import {Avatar, Drawer, Layout, Menu} from "antd5"
import Image from "next/image"
import {useRouter} from "next/navigation"
import {useState, useEffect} from "react"
import {useRecoilState} from "recoil"


import type {ReactNode, FC} from "react"
// import type {Product} from "~/types/db/Products"



import {activeProductState} from "../../../atoms/productAtom"
import SettingsMenu from "~/app/[productSlug]/dashboard/SettingsMenu"
import SideMenu from "~/app/[productSlug]/dashboard/SideMenu"
import useMainStore from "~/stores/mainStore"
import {getAllProducts} from "~/utils/fetch"



export type DashboardLayoutProps = {
	children: ReactNode
}

const DashboardLayout: FC<DashboardLayoutProps> = ({children}) => {
	const router = useRouter()
	const user = useMainStore((state) => state.user)
	const {data: products} = useQuery({
		queryKey: [`all-products`, user?.uid],
		// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
		queryFn: getAllProducts(user?.uid!),
		enabled: user?.uid !== undefined,
	})

	const setActiveProductId = useMainStore((state) => state.setActiveProduct)
	const activeProductId = useMainStore((state) => state.activeProduct)
	const [activeProduct, setActiveProduct] = useRecoilState(activeProductState)

	const [isSettingsOpen, setIsSettingsOpen] = useState(false)

	const handleProduct = (product: any) => {
		setActiveProduct(product)
		setActiveProductId(product.id)
		router.push(`/${product.slug}/dashboard`)
	}

	useEffect(() => {
		if(products) {
			let myProduct: any = products[0]
			if (activeProduct === null) {
				setActiveProduct(myProduct)
			} else {
				setActiveProduct(activeProduct)
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [products]);

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
								<button type="button" onClick={() => void handleProduct(product)} className="relative capitalize">
									{product.name}
									{activeProductId === product.id && <div className="absolute left-0 bottom-0 h-1 w-full bg-green" />}
								</button>
							),
						}))}
						className="grow bg-transparent"
					/>

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
