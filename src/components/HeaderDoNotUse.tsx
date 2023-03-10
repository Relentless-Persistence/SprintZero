import {CustomerServiceOutlined, LogoutOutlined, SettingOutlined, TeamOutlined} from "@ant-design/icons"
import {Avatar, Layout, Menu, Popover, Segmented} from "antd"
import {collection, doc, query, where} from "firebase/firestore"
import Image from "next/image"
import {usePathname} from "next/navigation"
import {useState} from "react"
import {useAuthState} from "react-firebase-hooks/auth"
import {useCollectionOnce, useDocument} from "react-firebase-hooks/firestore"

import type {FC} from "react"

import LinkTo from "~/components/LinkTo"
import {ProductConverter} from "~/types/db/Products"
import {auth, db} from "~/utils/firebase"
import {useSetTheme, useTheme} from "~/utils/ThemeContext"
import MoonIcon from "~public/icons/moon.svg"
import SunIcon from "~public/icons/sun.svg"

const HeaderDoNotUse: FC = () => {
	const pathname = usePathname()
	const slugs = pathname?.split(`/`)
	const activeProductId = slugs?.[1]

	const [activeProduct] = useDocument(
		activeProductId ? doc(db, `Products`, activeProductId).withConverter(ProductConverter) : undefined,
	)

	const [user] = useAuthState(auth)
	const [allProducts] = useCollectionOnce(
		user
			? query(collection(db, `Products`), where(`members.${user.uid}.type`, `in`, [`owner`, `editor`])).withConverter(
					ProductConverter,
			  )
			: undefined,
	)

	const [isPopoverOpen, setIsPopoverOpen] = useState(false)
	const theme = useTheme()
	const setTheme = useSetTheme()

	return (
		<Layout.Header className="flex items-center gap-8 !bg-[#161e12] !px-4">
			<LinkTo href="/">
				<Image src="/images/logo-dark.svg" alt="SprintZero logo" width={160} height={36} priority />
			</LinkTo>

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

			{activeProductId && (
				<Popover
					trigger="click"
					arrow={false}
					open={isPopoverOpen}
					onOpenChange={setIsPopoverOpen}
					overlayClassName="pr-2 pt-4"
					content={
						<div className="flex w-48 flex-col gap-4">
							<div className="flex flex-col gap-2">
								<p className="border-b border-border font-semibold leading-relaxed text-textTertiary">Theme</p>
								<Segmented
									block
									value={theme}
									onChange={(theme) => {
										setTheme(theme as `light` | `dark`)
										document.cookie = `theme=${theme};path=/`
									}}
									options={[
										{icon: <SunIcon className="inline-block" />, label: `Light`, value: `light`},
										{icon: <MoonIcon className="inline-block" />, label: `Dark`, value: `dark`},
									]}
								/>
							</div>
							<div className="flex flex-col gap-2">
								<p className="border-b border-border font-semibold leading-relaxed text-textTertiary">Settings</p>
								<Menu
									className="-mx-3 -mb-3 -mt-1 rounded-lg !border-0 [&>.ant-menu-item]:h-8 [&>.ant-menu-item]:leading-8"
									items={[
										{
											key: `configuration`,
											icon: <SettingOutlined />,
											label: <LinkTo href={`/${activeProductId}/settings/configuration`}>Configuration</LinkTo>,
											onClick: () => setIsPopoverOpen(false),
										},
										{
											key: `team`,
											icon: <TeamOutlined />,
											label: <LinkTo href={`/${activeProductId}/settings/team`}>Team</LinkTo>,
											onClick: () => setIsPopoverOpen(false),
										},
										{type: `divider`, className: `mx-3`},
										{
											key: `support`,
											icon: <CustomerServiceOutlined />,
											label: <LinkTo href="https://www.sprintzero.app/contact">Support</LinkTo>,
											onClick: () => setIsPopoverOpen(false),
										},
										{
											key: `sign-out`,
											icon: <LogoutOutlined />,
											label: <LinkTo href="/sign-out">Sign out</LinkTo>,
											onClick: () => setIsPopoverOpen(false),
										},
									]}
								/>
							</div>
							<p className="text-end text-sm text-textTertiary">v0.45</p>
						</div>
					}
				>
					<Avatar src={user?.photoURL} className="cursor-pointer border-2 border-primary" />
				</Popover>
			)}
		</Layout.Header>
	)
}

export default HeaderDoNotUse
