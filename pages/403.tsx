import {CloseOutlined} from "@ant-design/icons"
import {Avatar, Button, Drawer, Layout, Result} from "antd"
import Image from "next/image"
import {useState} from "react"
import {useAuthState} from "react-firebase-hooks/auth"

import type {FC} from "react"

import SettingsMenu from "~/app/(authenticated)/(mainApp)/SettingsMenu"
import LinkTo from "~/components/LinkTo"
import {auth} from "~/utils/firebase"

const Error403Page: FC = () => {
	const [user] = useAuthState(auth)
	const [isSettingsOpen, setIsSettingsOpen] = useState(false)

	return (
		<Layout className="h-full">
			<Layout.Header className="flex items-center justify-between !px-4">
				<Image src="/images/logo_beta.png" alt="SprintZero logo" width={178} height={42} priority />
				<button type="button" onClick={() => setIsSettingsOpen(true)}>
					<Avatar src={user?.photoURL} className="border-2 border-green" />
				</button>
			</Layout.Header>
			<Layout.Content className="grid place-items-center">
				<Result
					status="403"
					title="403"
					subTitle="Sorry, you are not authorized to access this page."
					extra={
						<div className="flex justify-center gap-4">
							<Button type="primary" onClick={() => history.back()}>
								Go back
							</Button>
							<LinkTo href="/">
								<Button>Exit</Button>
							</LinkTo>
						</div>
					}
				/>
			</Layout.Content>

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
		</Layout>
	)
}

export default Error403Page
