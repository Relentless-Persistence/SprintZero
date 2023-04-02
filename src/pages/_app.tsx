import Script from "next/script"

import type { AppProps } from "next/app"
import type { ReactElement } from "react"

import "../app/styles.css"

const CustomApp = ({ Component, pageProps }: AppProps): ReactElement | null => {
	return (

		<Component {...pageProps} />
	)
}

export default CustomApp
