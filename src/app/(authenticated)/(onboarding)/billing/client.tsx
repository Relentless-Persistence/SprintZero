"use client"

import { useEffect } from 'react';

// import type * as React from 'react';
import type { FC } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// declare global {
//     namespace JSX {
//         interface IntrinsicElements {
//             ['stripe-pricing-table']: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
//         }
//     }
// }

const PricingClientPage: FC = () => {

    const router = useRouter();
    const searchParams = useSearchParams();
    const session_id = searchParams?.get('session_id');

    useEffect(() => {
        // Do something with the session_id parameter
        // ...

        if (session_id) {
            router.push(`/configuration`)
        }
    });


    return (
        <div className='w-full'>
            {/* Add the Stripe pricing table element to the page */}
            {/* @ts-ignore */}
            <stripe-pricing-table
                pricing-table-id="prctbl_1MsFVIIUry2flRTcmQWTzv9C"
                publishable-key="pk_test_51Ji035IUry2flRTc8XUkfCQqzwcBBHiMCDLPmhJNTpDovjA7LnKQTELrmqiw6gy9eaWs973iEEDMKmKxwdj9vt4s00lcvsFZ0i"
            >
                {/* @ts-ignore */}
            </stripe-pricing-table>
        </div>
    );
};

export default PricingClientPage;