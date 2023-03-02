"use client"

import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import {httpBatchLink} from "@trpc/client"
import {ConfigProvider, theme as antdTheme} from "antd"
import {useState} from "react"
import invariant from "tiny-invariant"

import type {FC, ReactNode} from "react"

import {ThemeProvider} from "~/utils/ThemeContext"
import {trpc} from "~/utils/trpc"

export type RootProvidersProps = {
	children: ReactNode
	theme: `light` | `dark`
}

const RootProviders: FC<RootProvidersProps> = ({children, theme: defaultTheme}) => {
	const [theme, setTheme] = useState(defaultTheme)

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
	invariant(baseUrl, `NEXT_PUBLIC_BASE_URL is not set`)

	const [queryClient] = useState(() => new QueryClient())
	const [trpcClient] = useState(() =>
		trpc.createClient({
			links: [
				httpBatchLink({
					url: `${baseUrl}/trpc`,
				}),
			],
		}),
	)

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
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
		</trpc.Provider>
	)
}

export default RootProviders
