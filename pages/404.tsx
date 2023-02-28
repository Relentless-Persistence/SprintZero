import {Button, Layout, Result} from "antd"

import type {FC} from "react"

import Header from "~/app/(authenticated)/[productSlug]/Header"

const Error404Page: FC = () => {
	return (
		<Layout className="h-full">
			<Header />
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
	)
}

export default Error404Page
