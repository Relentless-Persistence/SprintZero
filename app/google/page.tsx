"use client"

import {useLoadScript} from "@react-google-maps/api"

import type {FC} from "react"

import Places from "./Places"

const Google: FC = () => {
	const {isLoaded} = useLoadScript({
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API || ``,
		libraries: [`places`],
	})

	if (!isLoaded) return <div>Loading...</div>

	return (
		<div>
			<Places />
		</div>
	)
}

export default Google
