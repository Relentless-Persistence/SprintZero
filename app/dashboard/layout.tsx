"use client"

import {
	ApiOutlined,
	CloseOutlined,
	DeploymentUnitOutlined,
	DollarOutlined,
	FormOutlined,
	HomeOutlined,
	LogoutOutlined,
	NodeExpandOutlined,
	PullRequestOutlined,
	SettingOutlined,
	TeamOutlined,
	UserOutlined,
} from "@ant-design/icons"
import {useQuery} from "@tanstack/react-query"
import {Avatar, Drawer, Layout, Menu} from "antd5"
import Image from "next/image"
import Link from "next/link"
import {usePathname} from "next/navigation"
import {useState} from "react"

import type {ReactElement, ReactNode} from "react"

import {getAllProducts} from "~/app/dashboard/fetch"
import {auth} from "~/config/firebase"
import useMainStore from "~/stores/mainStore"

const isActive = (pathname: string, currentPath: string) => pathname.toLowerCase() === currentPath.toLowerCase()

type Props = {
	children: ReactNode
}

const DashboardLayout = ({children}: Props): ReactElement | null => {
	const pathname = usePathname()

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
					<Image src="/images/logo_beta.png" alt="SprintZero logo" width={178} height={42} />

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
			<Layout>
				<Layout.Sider theme="light">
					<Menu
						mode="inline"
						selectedKeys={[`sidemenu-${(pathname ?? ``).split(`/`).at(-1)}`]}
						items={[
							{key: `sidemenu-dashboard`, icon: <HomeOutlined />, label: <Link href="/dashboard">Home</Link>},
							{
								key: `sidemenu-strategy`,
								icon: <DeploymentUnitOutlined />,
								label: `Strategy`,
								children: [
									{key: `sidemenu-kickoff`, label: <Link href="/dashboard/strategy/kickoff">Kickoff</Link>},
									{
										key: `sidemenu-accessibility`,
										label: <Link href="/dashboard/strategy/accessibility">Accessibility</Link>,
									},
									{key: `sidemenu-objectives`, label: <Link href="/dashboard/strategy/objectives">Objectives</Link>},
									{key: `sidemenu-vision`, label: <Link href="/dashboard/strategy/vision">Vision</Link>},
								],
							},
							{
								key: `sidemenu-tactics`,
								icon: <PullRequestOutlined />,
								label: `Tactics`,
								children: [
									{key: `sidemenu-ethics`, label: <Link href="/dashboard/tactics/ethics">Ethics</Link>},
									{key: `sidemenu-priorities`, label: <Link href="/dashboard/tactics/priorities">Priorities</Link>},
									{key: `sidemenu-release`, label: <Link href="/dashboard/tactics/release">Release</Link>},
									{
										key: `sidemenu-retrospective`,
										label: <Link href="/dashboard/tactics/retrospective">Retrospective</Link>,
									},
								],
							},
							{
								key: `sidemenu-operations`,
								icon: <NodeExpandOutlined />,
								label: `Operations`,
								children: [
									{key: `sidemenu-huddle`, label: <Link href="/dashboard/operations/huddle">Huddle</Link>},
									{key: `sidemenu-sprint`, label: <Link href="/dashboard/operations/sprint">Sprint</Link>},
									{key: `sidemenu-tasks`, label: <Link href="/dashboard/operations/tasks">Tasks</Link>},
								],
							},
							{
								key: `sidemenu-userbase`,
								icon: <UserOutlined />,
								label: `Userbase`,
								children: [
									{key: `sidemenu-dialogue`, label: <Link href="/dashboard/userbase/dialogue">Dialogue</Link>},
									{key: `sidemenu-journeys`, label: <Link href="/dashboard/userbase/journeys">Journeys</Link>},
									{key: `sidemenu-learnings`, label: <Link href="/dashboard/userbase/learnings">Learnings</Link>},
									{key: `sidemenu-personas`, label: <Link href="/dashboard/userbase/personas">Personas</Link>},
								],
							},
						]}
						style={{borderInlineEnd: `unset`}}
					/>
				</Layout.Sider>
				{children}
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
				<div className="flex h-full flex-col justify-between">
					<Menu
						selectedKeys={[`settings-${(pathname ?? ``).split(`/`).at(-1)}`]}
						items={[
							{
								key: `settings-account`,
								icon: <UserOutlined />,
								label: <Link href="/dashboard/settings/account">Account</Link>,
							},
							{
								key: `settings-billing`,
								icon: <DollarOutlined />,
								label: <Link href="/dashboard/settings/billing">Billing</Link>,
							},
							{
								key: `settings-config`,
								icon: <SettingOutlined />,
								label: <Link href="/dashboard/settings/config">Configuration</Link>,
							},
							{key: `settings-team`, icon: <TeamOutlined />, label: <Link href="/dashboard/settings/team">Team</Link>},
							{
								key: `settings-integrations`,
								icon: <ApiOutlined />,
								label: <Link href="/dashboard/settings/integrations">Integrations</Link>,
							},
						]}
						style={{borderInlineEnd: `unset`}}
					/>
					<Menu
						items={[
							{
								key: `settings-support`,
								icon: <FormOutlined />,
								label: <Link href="/dashboard/settings/support">Support</Link>,
							},
							{
								key: `settings-logout`,
								icon: <LogoutOutlined />,
								label: `Logout`,
								onClick: () => void auth.signOut(),
							},
						]}
						style={{borderInlineEnd: `unset`}}
					/>
				</div>
			</Drawer>
		</Layout>
	)
}

export default DashboardLayout
