"use client"

import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useLayoutEffect } from 'react';

// import type * as React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';

import type { FC } from 'react';

import { UserConverter } from '~/types/db/Users';
import { auth, db } from '~/utils/firebase';


// declare global {
//     namespace JSX {
//         interface IntrinsicElements {
//             ['stripe-pricing-table']: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
//         }
//     }
// }

const PricingClientPage: FC = () => {

    const [user, , userError] = useAuthState(auth)

    const router = useRouter();
    const searchParams = useSearchParams();
    const session_id = searchParams?.get(`session_id`);

    if (session_id) {
        //setHasAccepted(true)
        updateDoc(doc(db, `Users`, user!.uid).withConverter(UserConverter), {
            hasAcceptedTos: true,
        })
            .then(() => {
                router.push(`/configuration`);
            })
            .catch(error => {
                console.error(`Error updating document:`, error);
            });


    }

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