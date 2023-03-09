import {createContext, useContext} from "react"

import type {QueryDocumentSnapshot} from "firebase/firestore"
import type {Product} from "~/types/db/Products"

export const ProductContext = createContext<QueryDocumentSnapshot<Product> | undefined>(undefined)
export const useProduct = (): QueryDocumentSnapshot<Product> | undefined => useContext(ProductContext)
