"use client"

import { Avatar } from 'antd';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useLayoutEffect } from 'react';

// import type * as React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';

import type { FC } from 'react';

import LinkTo from '~/components/LinkTo';
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
            <div className="flex items-center flex-end gap-4">
                <div className="flex min-w-0 flex-1 flex-col items-end gap-1">
                    <div className="flex w-full flex-1 items-center gap-3">
                        <div className="min-w-0 flex-1 text-end leading-normal">
                            <p className="font-semibold">{user?.displayName}</p>
                            <p className="truncate text-sm text-textTertiary">{user?.email}</p>
                        </div>
                        <Avatar
                            src={user?.photoURL}
                            size={48}
                            alt="Avatar"
                            className="shrink-0 basis-auto border border-primary"
                        />
                    </div>
                    <LinkTo href="/sign-out" className="text-sm text-info">
                        Log out
                    </LinkTo>
                </div>
            </div>
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