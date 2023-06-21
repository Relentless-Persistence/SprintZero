import Script from "next/script"

import type { AppProps } from "next/app"
import type { ReactElement } from "react"

import "../app/styles.css"

const CustomApp = ({ Component, pageProps }: AppProps): ReactElement | null => {
	if (process.env.NODE_ENV !== `production`) {
		return <Component {...pageProps} />
	}

	return (
		<>
			<Script
				strategy="afterInteractive"
				src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
			/>
			<Script id="google-analytics" strategy="afterInteractive">
				{`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());` +
					`gtag('config', '` + String(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) + `');`}
			</Script>
			<Component {...pageProps} />
		</>
	)
}

export default CustomApp
