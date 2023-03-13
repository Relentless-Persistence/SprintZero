"use client"

import {Result} from "antd"

import type {FC} from "react"

type AppErrorProps = {
	error: Error
}

const ProductError: FC<AppErrorProps> = ({error}) => {
	return (
		<div className="grid h-full place-items-center">
			<Result status="error" title="An error occurred." subTitle={error.message} />
		</div>
	)
}

export default ProductError
