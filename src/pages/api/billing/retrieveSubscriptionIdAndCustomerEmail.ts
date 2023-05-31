
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
    apiVersion: `2022-11-15`,
});

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { sessionId } = req.query;

    try {
        const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId as string);
        const subscriptionId = checkoutSession.subscription as string;
        const customerEmail = checkoutSession.customer_details?.email as string;

        res.status(200).json({ subscriptionId, customerEmail });
    } catch (error) {
        console.error(`Error retrieving subscription ID:`, error);
        res.status(500).json({ error: `An error occurred while retrieving the subscription ID.` });
    }
}
