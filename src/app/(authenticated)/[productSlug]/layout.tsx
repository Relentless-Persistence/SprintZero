"use client"

import {Layout} from "antd"
import {doc} from "firebase/firestore"
import {usePathname} from "next/navigation"
import {useAuthState} from "react-firebase-hooks/auth"
import {useDocument} from "react-firebase-hooks/firestore"
import invariant from "tiny-invariant"

import type {FC, ReactNode} from "react"

import {AppContext} from "./AppContext"
import Header from "./Header"
import {ProductConverter} from "~/types/db/Products"
import {UserConverter} from "~/types/db/Users"
import {conditionalThrow} from "~/utils/conditionalThrow"
import {auth, db} from "~/utils/firebase"

export type MainAppLayoutProps = {
	children: ReactNode
}

const MainAppLayout: FC<MainAppLayoutProps> = ({children}) => {
	const [user] = useAuthState(auth)

	const pathname = usePathname()
	const slugs = pathname?.split(`/`)
	const productId = slugs?.[1]
	invariant(productId, `No product ID in pathname`)

	const [dbUser, , dbUserLoading] = useDocument(
		user ? doc(db, `Users`, user.uid).withConverter(UserConverter) : undefined,
	)
	const [product, , productLoading] = useDocument(doc(db, `Products`, productId).withConverter(ProductConverter))
	conditionalThrow(dbUserLoading, productLoading)

	if (!dbUser?.exists() || !product?.exists()) return null
	return (
		<AppContext.Provider value={{product, user: dbUser}}>
			<Layout className="h-full">
				<Header />
				<Layout>{children}</Layout>
			</Layout>
		</AppContext.Provider>
	)
}

export default MainAppLayout
