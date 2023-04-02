import Script from "next/script"

import type { FC } from "react"

import PricingClientPage from "./client"

export const metadata = {
    title: `Billing | SprintZero`,
}

const PricingPage: FC = () => {
    return (
        <>
            <Script async src="https://js.stripe.com/v3/pricing-table.js"></Script>
            <PricingClientPage />
        </>
    )

}

export default PricingPage
