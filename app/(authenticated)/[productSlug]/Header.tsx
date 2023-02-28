import {
	CloseOutlined,
	CustomerServiceOutlined,
	IdcardOutlined,
	LogoutOutlined,
	SettingOutlined,
	TeamOutlined,
} from "@ant-design/icons"
import {Avatar, Drawer, Layout, Menu, Popover, Segmented} from "antd"
import {collection, doc, query, where} from "firebase/firestore"
import Image from "next/image"
import {useState} from "react"
import {useAuthState} from "react-firebase-hooks/auth"
import {useCollectionOnce, useDocument} from "react-firebase-hooks/firestore"
import invariant from "tiny-invariant"

import type {FC} from "react"

import SettingsMenu from "./SettingsMenu"
import LinkTo from "~/components/LinkTo"
import MoonIcon from "~/public/images/moon-icon.svg"
import SunIcon from "~/public/images/sun-icon.svg"
import {ProductConverter} from "~/types/db/Products"
import {auth, db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

const Header: FC = () => {
	const activeProductId = useActiveProductId()
	const [activeProduct] = useDocument(doc(db, `Products`, activeProductId).withConverter(ProductConverter))

	const [user] = useAuthState(auth)
	invariant(user, `User state not loaded`)
	const [allProducts] = useCollectionOnce(
		query(collection(db, `Products`), where(`members.${user.uid}.type`, `==`, `editor`)).withConverter(
			ProductConverter,
		),
	)

	const [isSettingsOpen, setIsSettingsOpen] = useState(false)

	return (
		<>
			<Layout.Header className="flex items-center gap-8 !bg-[#161e12] !px-4">
				<Image src="/images/logo_beta.png" alt="SprintZero logo" width={178} height={42} priority />

				<Menu
					theme="dark"
					mode="horizontal"
					selectedKeys={[activeProduct?.id ?? ``]}
					items={allProducts?.docs.map((product) => ({
						key: product.id,
						label: (
							<LinkTo href={`/${product.id}/map`} className="relative">
								{product.data().name}
							</LinkTo>
						),
					}))}
					className="grow [&>.ant-menu-item-selected]:shadow-[inset_0px_-4px_0px_0px_theme(colors.primary)] [&>.ant-menu-item]:cursor-default"
					style={{background: `transparent`}}
				/>

				<Popover
					trigger="click"
					arrow={false}
					content={
						<div className="flex w-48 flex-col gap-4">
							<div className="flex flex-col gap-2">
								<p className="border-b border-border font-semibold text-textTertiary">Theme</p>
								<Segmented
									block
									options={[
										{icon: <SunIcon className="inline-block" />, label: `Light`, value: `light`},
										{icon: <MoonIcon className="inline-block" />, label: `Dark`, value: `dark`},
									]}
								/>
							</div>
							<div className="flex flex-col gap-2">
								<p className="border-b border-border font-semibold text-textTertiary">Settings</p>
								<Menu
									className="-mx-3 -mb-3 -mt-1 rounded-lg !border-0 [&>.ant-menu-item]:h-8 [&>.ant-menu-item]:leading-8"
									items={[
										{
											key: `account`,
											icon: <IdcardOutlined />,
											label: <LinkTo href="/settings/account">Account</LinkTo>,
										},
										{key: `configuration`, icon: <SettingOutlined />, label: `Configuration`},
										{key: `team`, icon: <TeamOutlined />, label: `Team`},
										{type: `divider`, className: `mx-3`},
										{key: `support`, icon: <CustomerServiceOutlined />, label: `Support`},
										{key: `sign-out`, icon: <LogoutOutlined />, label: `Sign out`},
									]}
								/>
							</div>
							<p className="text-end text-sm text-textTertiary">v0.45</p>
						</div>
					}
				>
					<Avatar src={user.photoURL} className="border-2 border-primary" />
				</Popover>
			</Layout.Header>

			<Drawer
				title="Settings"
				closable={false}
				width="192px"
				open={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
				extra={
					<button type="button" onClick={() => setIsSettingsOpen(false)}>
						<CloseOutlined />
					</button>
				}
				bodyStyle={{padding: `12px`}}
			>
				<SettingsMenu onClose={() => setIsSettingsOpen(false)} />
			</Drawer>
		</>
	)
}

export default Header
