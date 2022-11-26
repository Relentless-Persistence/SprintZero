"use client"

import {QueryClientProvider} from "@tanstack/react-query"
import {ConfigProvider} from "antd5"
import {onAuthStateChanged} from "firebase9/auth"
import {useEffect} from "react"

import type {ReactElement, ReactNode} from "react"

import "./styles.css"
import {getAllProducts} from "~/app/dashboard/fetch"
import {auth} from "~/config/firebase"
import {queryClient} from "~/config/reactQuery"
import useMainStore from "~/stores/mainStore"

type Props = {
	children: ReactNode
}

const RootLayout = ({children}: Props): ReactElement | null => {
	const setUser = useMainStore((state) => state.setUser)
	const activeProductId = useMainStore((state) => state.activeProductId)
	const setActiveProductId = useMainStore((state) => state.setActiveProductId)

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			setUser(user)
			if (!user) return

			if (activeProductId) return
			const firstProduct = (await getAllProducts(user.uid)())[0]!
			setActiveProductId(firstProduct.id)
		})

		return unsubscribe
	}, [setUser, activeProductId, setActiveProductId])

	return (
		<ConfigProvider theme={{token: {colorPrimary: `#73c92d`}}}>
			<QueryClientProvider client={queryClient}>
				<html lang="en" className="h-full">
					<head></head>
					<body className="h-full">{children}</body>
				</html>
			</QueryClientProvider>
		</ConfigProvider>
	)
}

export default RootLayout
