import React from "react"
import Head from "next/head"
import Layout from "../components/Layout"
import Login from "../components/Login"
import {GoogleReCaptchaProvider} from "react-google-recaptcha-v3"

const login = () => {
	return (
		<GoogleReCaptchaProvider
			reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
			scriptProps={{
				async: false, // optional, default to false,
				defer: true, // optional, default to false
				appendTo: "body", // optional, default to "head", can be "head" or "body",
				nonce: undefined,
			}}
		>
			<div>
				<Head>
					<title>Login | Sprint Zero</title>
					<link rel="icon" href="/favicon.ico" />
				</Head>

				<Layout>
					<Login />
				</Layout>
			</div>
		</GoogleReCaptchaProvider>
	)
}

export default login
