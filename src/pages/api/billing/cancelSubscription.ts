import { firestore } from "firebase-admin";
import Stripe from "stripe";

import type { NextApiRequest, NextApiResponse } from "next";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: `2020-08-27`,
});

// Initialize Firestore
const db = firestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === `POST`) {
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers[`stripe-signature`],
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    if (event.type === `customer.subscription.deleted`) {
      const subscription = event.data.object as Stripe.Subscription;

      // Get all products for the user from Firestore
      const snapshot = await db
        .collection(`Billings`)
        .where(`subscriptionId`, `==`, subscription.id)
        .get();

      // Loop through all docs and update the status to 'cancelled'
      snapshot.docs.forEach(async (doc) => {
        const billingId = doc.id;
        const billingData = doc.data();

        // Update all products tied to the subscription
        const productsSnapshot = await db
          .collection(`Products`)
          .where(`billingId`, `==`, billingId)
          .get();

        const batch = db.batch();
        productsSnapshot.docs.forEach((doc) => {
          const productRef = db.collection(`Products`).doc(doc.id);
          batch.update(productRef, { status: `cancelled` });
        });

        await batch.commit();
      });

      res.json({ received: true });
    } else {
      res.json({ received: true });
    }
  } else {
    // Handle other HTTP methods
    res.setHeader(`Allow`, `POST`);
    res.status(405).end(`Method Not Allowed`);
  }
}
