"use client"

import {useJsApiLoader} from "@react-google-maps/api"
import {useMemo} from "react"

import type {FC} from "react"

import Places from "./Places"

const Google: FC = () => {
	const {isLoaded} = useJsApiLoader({
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ``,
		libraries: useMemo(() => [`places`], []),
	})

	if (!isLoaded) return <p>Loading...</p>

	return (
		<div>
			<Places />
		</div>
	)
}

export default Google
