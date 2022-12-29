import {useQuery} from "@tanstack/react-query"
import {redirect} from "next/navigation"
import {useEffect} from "react"

import type {FC} from "react"

import useMainStore from "~/stores/mainStore"
import {getProduct} from "~/utils/fetch"

const Home: FC = () => {
	const activeProduct = useMainStore((state) => state.activeProduct)
	const {data: product} = useQuery({
		queryKey: [`product`, activeProduct],
		queryFn: getProduct(activeProduct!),
		enabled: activeProduct !== null,
	})

	useEffect(() => {
		redirect(`/${product?.slug}/dashboard/`)
	}, [product?.slug])

	return <div></div>
}

export default Home
