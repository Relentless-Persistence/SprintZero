"use client"

import {QueryClientProvider} from "@tanstack/react-query"
import {ConfigProvider} from "antd5"
import {onAuthStateChanged} from "firebase9/auth"
import {useRouter} from "next/navigation"
import {useEffect} from "react"
import {RecoilRoot} from "recoil"

import type {ReactNode, FC} from "react"

import "./styles.css"
import {auth} from "~/config/firebase"
import {queryClient} from "~/config/reactQuery"
import useMainStore from "~/stores/mainStore"
import {getAllProducts} from "~/utils/fetch"

export type RootLayoutProps = {
	children: ReactNode
}

const RootLayout: FC<RootLayoutProps> = ({children}) => {
	const setUser = useMainStore((state) => state.setUser)
	const activeProduct = useMainStore((state) => state.activeProduct)

	const {replace} = useRouter()
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			setUser(user)
			if (!user) {
				replace(`/`)
				return
			}

			if (activeProduct) return
			const firstProduct = (await getAllProducts(user.uid)())[0]
			if (!firstProduct) {
				replace(`/product`)
				return
			}
			replace(`/${firstProduct.slug}/dashboard/`)
		})

		return unsubscribe
	}, [setUser, activeProduct, replace])

	return (
		<ConfigProvider theme={{token: {colorPrimary: `#73c92d`}}}>
			<QueryClientProvider client={queryClient}>
				<RecoilRoot>
					<html lang="en" className="h-full">
						<head></head>
						<body className="h-full bg-[#f0f2f5] text-sm">{children}</body>
					</html>
				</RecoilRoot>
			</QueryClientProvider>
		</ConfigProvider>
	)
}

export default RootLayout
