"use client"

import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import {ConfigProvider, theme as antdTheme} from "antd"
import {useState} from "react"

import type {FC, ReactNode} from "react"

import {ThemeProvider} from "~/utils/ThemeContext"

const queryClient = new QueryClient()

export type RootProvidersProps = {
	children: ReactNode
	theme: `light` | `dark`
}

const RootProviders: FC<RootProvidersProps> = ({children, theme: defaultTheme}) => {
	const [theme, setTheme] = useState(defaultTheme)

	return (
		<QueryClientProvider client={queryClient}>
			<ConfigProvider
				theme={{
					token: {colorPrimary: `#54a31c`},
					algorithm: theme === `light` ? antdTheme.defaultAlgorithm : antdTheme.darkAlgorithm,
				}}
			>
				<ThemeProvider
					value={{
						theme,
						setTheme: (value) => {
							setTheme(value)
							document.documentElement.classList.remove(value === `light` ? `dark` : `light`)
							document.documentElement.classList.add(value === `light` ? `light` : `dark`)
						},
					}}
				>
					{children}
				</ThemeProvider>
			</ConfigProvider>
		</QueryClientProvider>
	)
}

export default RootProviders
