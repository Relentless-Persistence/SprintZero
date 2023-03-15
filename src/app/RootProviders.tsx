"use client"

import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import {httpBatchLink} from "@trpc/client"
import {ConfigProvider, theme as antdTheme} from "antd"
import "core-js/es/array/find-last"
import {doc} from "firebase/firestore"
import {useState} from "react"
import {useErrorHandler} from "react-error-boundary"
import {useAuthState} from "react-firebase-hooks/auth"
import {useDocument} from "react-firebase-hooks/firestore"
import invariant from "tiny-invariant"

import type {FC, ReactNode} from "react"

import MaintenancePage from "~/components/MaintenanceScreen"
import {AppInfoConverter} from "~/types/db/AppInfo"
import {UserConverter} from "~/types/db/Users"
import {auth, db} from "~/utils/firebase"
import {ThemeProvider} from "~/utils/ThemeContext"
import {trpc} from "~/utils/trpc"

export type RootProvidersProps = {
	children: ReactNode
	theme: `light` | `dark`
}

const RootProviders: FC<RootProvidersProps> = ({children, theme: browserTheme}) => {
	const [themeSetting, setThemeSetting] = useState<`light` | `auto` | `dark`>(`auto`)
	const theme = themeSetting === `auto` ? browserTheme : themeSetting

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

	const [appInfo, appInfoLoading, appInfoError] = useDocument(
		doc(db, `AppInfo`, `info`).withConverter(AppInfoConverter),
	)
	useErrorHandler(appInfoError)
	const [user, , userError] = useAuthState(auth)
	useErrorHandler(userError)
	const [dbUser, , dbUserError] = useDocument(
		user ? doc(db, `Users`, user.uid).withConverter(UserConverter) : undefined,
	)
	useErrorHandler(dbUserError)

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
								setThemeSetting(value)
								document.documentElement.classList.remove(theme === `light` ? `dark` : `light`)
								document.documentElement.classList.add(theme === `light` ? `light` : `dark`)
							},
						}}
					>
						{!appInfoLoading &&
							(appInfo?.data()?.maintenanceMode && dbUser?.data()?.type !== `admin` ? (
								<MaintenancePage />
							) : (
								<div className="isolate h-full">{children}</div>
							))}
					</ThemeProvider>
				</ConfigProvider>
			</QueryClientProvider>
		</trpc.Provider>
	)
}

export default RootProviders
