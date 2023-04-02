"use client"

import { loadStripe } from '@stripe/stripe-js';
import Head from 'next/head';
import Script from 'next/script';
import { useEffect } from 'react';

// import type * as React from 'react';
import type { FC } from 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['stripe-pricing-table']: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}

const PricingClientPage: FC = () => {
    return (
        <div className='w-full'>
            {/* Add the Stripe pricing table element to the page */}
            <stripe-pricing-table
                pricing-table-id="prctbl_1MsFVIIUry2flRTcmQWTzv9C"
                publishable-key="pk_test_51Ji035IUry2flRTc8XUkfCQqzwcBBHiMCDLPmhJNTpDovjA7LnKQTELrmqiw6gy9eaWs973iEEDMKmKxwdj9vt4s00lcvsFZ0i"
            >
            </stripe-pricing-table>
        </div>
    );
};

export default PricingClientPage;