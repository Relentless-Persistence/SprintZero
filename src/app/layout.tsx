import clsx from "clsx"
import {cookies} from "next/headers"
import {z} from "zod"

import type {FC, ReactNode} from "react"

import RootProviders from "./RootProviders"
import "./styles.css"

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
	const theme = (cookies().get(`theme`)?.value as `light` | `dark` | undefined) ?? `light`

	return (
		<html lang="en" className={clsx(`h-full`, theme)}>
			<head></head>
			<body className="h-full bg-bgLayout text-base leading-none text-text">
				<RootProviders theme={theme}>{children}</RootProviders>
			</body>
		</html>
	)
}

export default RootLayout
