import {CloseOutlined} from "@ant-design/icons"
import {Avatar, Button, Drawer, Layout, Result} from "antd"
import Image from "next/image"
import {useState} from "react"
import {useAuthState} from "react-firebase-hooks/auth"

import type {FC} from "react"

import SettingsMenu from "~/app/(authenticated)/[productSlug]/SettingsMenu"
import {auth} from "~/utils/firebase"

const Error500Page: FC = () => {
	const [user] = useAuthState(auth)
	const [isSettingsOpen, setIsSettingsOpen] = useState(false)

	return (
		<Layout className="h-full">
			<Layout.Header className="flex items-center justify-between !px-4">
				<Image src="/images/logo_beta.png" alt="SprintZero logo" width={178} height={42} priority />
				<button type="button" onClick={() => setIsSettingsOpen(true)}>
					<Avatar src={user?.photoURL} className="border-2 border-primary" />
				</button>
			</Layout.Header>
			<Layout.Content className="grid place-items-center">
				<Result
					status="500"
					title="Error 500: Internal Server Error"
					subTitle="We apologize for the inconvenience, but an unexpected error has occurred while processing your request. This may be due to an issue with our server, and our technical team has been notified of the problem. We appreciate your patience while we work to resolve this issue. Please try again later or contact our support team for assistance at support@sprintzero.app."
					extra={
						<Button type="primary" onClick={() => history.back()}>
							Go back
						</Button>
					}
					className="max-w-2xl"
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

export default Error500Page
