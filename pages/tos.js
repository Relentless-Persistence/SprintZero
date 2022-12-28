import React from "react"
import Head from "next/head"
import AuthLayout from "../components/AuthLayout"
import Agreement from "../components/Agreement"

const tos = () => {
	return (
		<div>
			<Head>
				<title>Agreement | Sprint Zero</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<AuthLayout>
				<Agreement />
			</AuthLayout>
		</div>
	)
}

export default tos;
