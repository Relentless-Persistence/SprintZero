"use client"

import {QueryClientProvider} from "@tanstack/react-query"
import "antd/dist/antd.css"
import {ConfigProvider} from "antd5"
import {onAuthStateChanged} from "firebase9/auth"
import {useSetAtom} from "jotai"
import {useRouter} from "next/navigation"
import {useEffect} from "react"

import type {ReactNode, FC} from "react"
import type {Id} from "~/types"

import "./styles.css"
import {auth} from "~/config/firebase"
import {queryClient} from "~/config/reactQuery"
import {userIdAtom} from "~/utils/atoms"

export type RootLayoutProps = {
	children: ReactNode
}

const RootLayout: FC<RootLayoutProps> = ({children}) => {
	const setUserId = useSetAtom(userIdAtom)

	const {replace} = useRouter()
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (!user) {
				replace(`/login`)
				return
			}
			setUserId(user.uid as Id)
		})

		return unsubscribe
	}, [setUserId, replace])

	return (
		<ConfigProvider theme={{token: {colorPrimary: `#4a801e`, borderRadius: 0}}}>
			<QueryClientProvider client={queryClient}>
				<html lang="en" className="h-full">
					<head></head>
					<body className="h-full bg-[#f0f2f5] text-sm">{children}</body>
				</html>
			</QueryClientProvider>
		</ConfigProvider>
	)
}

export default RootLayout
