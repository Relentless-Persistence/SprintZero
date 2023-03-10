import {createContext, useContext} from "react"

import type {QueryDocumentSnapshot} from "firebase/firestore"
import type {Product} from "~/types/db/Products"
import type {User} from "~/types/db/Users"

export const AppContext = createContext<{product: QueryDocumentSnapshot<Product>; user: QueryDocumentSnapshot<User>}>(
	undefined as never,
)

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useAppContext = () => useContext(AppContext)
