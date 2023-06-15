
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
    apiVersion: `2022-11-15`,
});

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { subscriptionId } = req.query;

    try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId?.toString() ?? ``);

        res.status(200).json({ subscription });
    } catch (error) {
        console.error(`Error retrieving subscription:`, error);
        res.status(500).json({ error: `An error occurred while retrieving the subscription.` });
    }
}
