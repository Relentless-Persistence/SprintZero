"use client"

import {ConfigProvider} from "antd"
import {useRouter} from "next/navigation"
import {useAuthState} from "react-firebase-hooks/auth"
import {z} from "zod"

import type {ReactNode, FC} from "react"

import "./styles.css"
import {auth} from "~/utils/firebase"

z.setErrorMap((issue, ctx) => {
	switch (issue.code) {
		case z.ZodIssueCode.invalid_string: {
			switch (issue.validation) {
				case `url`:
					return {message: `Invalid URL.`}
			}
		}
	}
	return {message: ctx.defaultError}
})

export type RootLayoutProps = {
	children: ReactNode
}

const RootLayout: FC<RootLayoutProps> = ({children}) => {
	const router = useRouter()

	const [user, loading] = useAuthState(auth)
	if (!user && !loading) router.replace(`/login`)

	return (
		<ConfigProvider theme={{token: {colorPrimary: `#4a801d`}}}>
			<html lang="en" className="h-full">
				<head></head>
				<body className="h-full bg-[#f0f2f5] text-sm">{!loading && children}</body>
			</html>
		</ConfigProvider>
	)
}

export default RootLayout
