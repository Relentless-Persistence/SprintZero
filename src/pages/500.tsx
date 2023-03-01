import {Button, Layout, Result} from "antd"

import type {FC} from "react"

import RootProviders from "~/app/RootProviders"
import HeaderDoNotUse from "~/components/HeaderDoNotUse"

const Error500Page: FC = () => {
	return (
		<RootProviders theme="light">
			<Layout className="h-full">
				<HeaderDoNotUse />
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
			</Layout>
		</RootProviders>
	)
}

export default Error500Page
