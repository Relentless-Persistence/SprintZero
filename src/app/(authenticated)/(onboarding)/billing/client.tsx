"use client"

import React, { FC, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import Head from 'next/head';

const PricingClientPage: FC = () => {
    // useEffect(() => {
    //     // Load the Stripe publishable key and the pricing table element
    //     const stripePromise = loadStripe('pk_test_51Ji035IUry2flRTc8XUkfCQqzwcBBHiMCDLPmhJNTpDovjA7LnKQTELrmqiw6gy9eaWs973iEEDMKmKxwdj9vt4s00lcvsFZ0i');
    //     stripePromise.then(() => {
    //         // Get the Stripe pricing table element
    //         const pricingTable = document.getElementsByTagName('stripe-pricing-table')[0];
    //         if (!pricingTable) {
    //             console.error('stripe-pricing-table element not found');
    //             return;
    //         }
    //         // Set the pricing table ID
    //         pricingTable.setAttribute('pricing-table-id', 'prctbl_1MsFVIIUry2flRTcmQWTzv9C');
    //     }).catch((error) => {
    //         console.error('Error loading Stripe:', error);
    //     });
    // }, []);

    return (
        <>
            <Head>
                {/* Include the Stripe JS script in the page header */}
                <script src="https://js.stripe.com/v3/"></script>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@stripe/react-stripe-js@1.4.0/styles.min.css" />
            </Head>
            helloooo
            {/* Add the Stripe pricing table element to the page */}
            <stripe-pricing-table
                pricing-table-id="prctbl_1MsFVIIUry2flRTcmQWTzv9C"
                publishable-key="pk_test_51Ji035IUry2flRTc8XUkfCQqzwcBBHiMCDLPmhJNTpDovjA7LnKQTELrmqiw6gy9eaWs973iEEDMKmKxwdj9vt4s00lcvsFZ0i"
            >
            </stripe-pricing-table>

        </>
    );
};

export default PricingClientPage;
