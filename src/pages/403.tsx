import {Button, Layout, Result} from "antd"

import type {FC} from "react"

import Header from "~/app/(authenticated)/[productSlug]/Header"

const Error403Page: FC = () => {
	return (
		<Layout className="h-full">
			<Header />
			<Layout.Content className="grid place-items-center">
				<Result
					status="403"
					title="Error 403: Forbidden"
					subTitle="We apologize, but you do not have permission to access the requested resource. This may be due to insufficient privileges or authentication issues. Please contact support@sprintzero.app if you believe this to be an error or if you require access to this resource."
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

export default Error403Page
