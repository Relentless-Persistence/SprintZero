import {CustomerServiceOutlined, LogoutOutlined, SettingOutlined, TeamOutlined} from "@ant-design/icons"
import {Avatar, Layout, Menu, Popover, Segmented} from "antd"
import {collection, collectionGroup, query, where} from "firebase/firestore"
import Image from "next/image"
import {useState} from "react"
import {useCollection, useCollectionOnce} from "react-firebase-hooks/firestore"

import type {FC} from "react"

import {useAppContext} from "./AppContext"
import LinkTo from "~/components/LinkTo"
import {MemberConverter} from "~/types/db/Products/Members"
import {conditionalThrow} from "~/utils/conditionalThrow"
import {db} from "~/utils/firebase"
import {useSetTheme, useTheme} from "~/utils/ThemeContext"
import MoonIcon from "~public/icons/moon.svg"
import SunIcon from "~public/icons/sun.svg"

const Header: FC = () => {
	const {product, user} = useAppContext()

	const [members, , membersError] = useCollectionOnce(
		query(
			collectionGroup(db, `Members`),
			where(`id`, `==`, user.id),
			where(`type`, `in`, [`owner`, `editor`]),
		).withConverter(MemberConverter),
	)
	const [products, , productsError] = useCollection(
		members
			? query(
					collection(db, `Products`),
					where(
						`id`,
						`in`,
						members.docs.map((member) => member.ref.parent.parent!.id),
					),
			  )
			: undefined,
	)
	conditionalThrow(membersError, productsError)

	const currentProductMember = members?.docs.find((member) => member.ref.parent.parent!.id === product.id)

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
				selectedKeys={[product.id]}
				items={products?.docs.map((product) => ({
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
								selectedKeys={[]}
								className="-mx-3 -mb-3 -mt-1 rounded-lg !border-0 bg-bgElevated [&>.ant-menu-item]:h-8 [&>.ant-menu-item]:leading-8"
								items={[
									...(currentProductMember?.data()?.type === `owner`
										? ([
												{
													key: `configuration`,
													icon: <SettingOutlined />,
													label: <LinkTo href={`/${product.id}/settings/configuration`}>Configuration</LinkTo>,
													onClick: () => setIsPopoverOpen(false),
												},
												{
													key: `team`,
													icon: <TeamOutlined />,
													label: <LinkTo href={`/${product.id}/settings/team`}>Team</LinkTo>,
													onClick: () => setIsPopoverOpen(false),
												},
												{type: `divider`, className: `mx-3`},
										  ] as const)
										: []),
									...[
										{
											key: `support`,
											icon: <CustomerServiceOutlined />,
											label: (
												<LinkTo href="https://www.sprintzero.app/contact" openInNewTab>
													Support
												</LinkTo>
											),
											onClick: () => setIsPopoverOpen(false),
										},
										{
											key: `sign-out`,
											icon: <LogoutOutlined />,
											label: <LinkTo href="/sign-out">Sign out</LinkTo>,
											onClick: () => setIsPopoverOpen(false),
										},
									],
								]}
							/>
						</div>
						<p className="text-end text-sm text-textTertiary">v0.45</p>
					</div>
				}
			>
				<Avatar src={user.data().avatar} className="cursor-pointer border-2 border-primary" />
			</Popover>
		</Layout.Header>
	)
}

export default Header
