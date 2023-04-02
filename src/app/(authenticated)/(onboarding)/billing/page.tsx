import Script from "next/script"
import type { FC } from "react"

import PricingClientPage from "./client"

export const metadata = {
    title: `Billing | SprintZero`,
}

const PricingPage: FC = () => {
    return (
        <>
            {/* <Script src="https://js.stripe.com/v3/" strategy="beforeInteractive" /> */}
            <Script src="https://js.stripe.com/v3/" strategy="beforeInteractive" />
            <PricingClientPage />
        </>
    )

}

export default PricingPage
