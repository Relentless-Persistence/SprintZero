"use client"

import { Avatar } from 'antd';
import { addDoc, collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useLayoutEffect } from 'react';

// import type * as React from 'react';
import { useErrorHandler } from 'react-error-boundary';
import { useAuthState } from 'react-firebase-hooks/auth';

import type { FC } from 'react';

import LinkTo from '~/components/LinkTo';
import { BillingConverter } from '~/types/db/Billings';
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

    useErrorHandler(userError)

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
                pricing-table-id="prctbl_1MsWMcIUry2flRTcck3ARuqX"
                publishable-key="pk_live_51Ji035IUry2flRTc2LMpEtx61pG8Wy9JcxQDWjgvzNIyzwolUWHa8Ro5vdBtlb55p6HogAJotBW3BtDHfeoHtF1i00W5TlQctT">
                {/* @ts-ignore */}
            </stripe-pricing-table>
        </div>
    );
};

export default PricingClientPage;