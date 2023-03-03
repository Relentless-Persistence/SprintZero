"use client"

import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import {httpBatchLink} from "@trpc/client"
import {Alert, ConfigProvider, theme as antdTheme} from "antd"
import {doc} from "firebase/firestore"
import {useEffect, useState} from "react"
import {useDocument} from "react-firebase-hooks/firestore"
import invariant from "tiny-invariant"

import type {FC, ReactNode} from "react"

import MaintenancePage from "~/components/MaintenanceScreen"
import {AppInfoConverter} from "~/types/db/AppInfo"
import {db} from "~/utils/firebase"
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

	const [appInfo, loading] = useDocument(doc(db, `AppInfo`, `info`).withConverter(AppInfoConverter))
	const [loadedVersion, setLoadedVersion] = useState<number | undefined>(undefined)
	useEffect(() => {
		if (!loading && appInfo?.exists() && loadedVersion === undefined) setLoadedVersion(appInfo.data().version)
	}, [appInfo, loadedVersion, loading])

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
						{!loading && (appInfo?.data()?.maintenanceMode ? <MaintenancePage /> : children)}
						{!appInfo?.data()?.maintenanceMode && loadedVersion !== appInfo?.data()?.version && (
							<Alert
								type="warning"
								showIcon
								message="A new version of the app is available. Reload the page to update."
								className="fixed bottom-8 right-12"
							/>
						)}
					</ThemeProvider>
				</ConfigProvider>
			</QueryClientProvider>
		</trpc.Provider>
	)
}

export default RootProviders
