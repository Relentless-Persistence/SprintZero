import {Button, Layout, Result} from "antd"

import type {FC} from "react"

import RootProviders from "~/app/RootProviders"
import HeaderDoNotUse from "~/components/HeaderDoNotUse"

const Error404Page: FC = () => {
	return (
		<RootProviders theme="light">
			<Layout className="h-full">
				<HeaderDoNotUse />
				<Layout.Content className="grid place-items-center">
					<Result
						status="404"
						title="Error 404: Page not found"
						subTitle="We're sorry, but the page you are trying to access cannot be found. Please check the URL and try again. If you continue to experience this issue, please contact our support team for assistance at support@sprintzero.app."
						extra={
							<Button type="primary" onClick={() => history.back()}>
								Go back
							</Button>
						}
						className="max-w-2xl"
					/>
				</Layout.Content>
			</Layout>
		</RootProviders>
	)
}

export default Error404Page
