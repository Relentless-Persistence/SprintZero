import Stripe from "stripe";

const stripe = new Stripe(process.env.NEXT_PUBLIC_SECRET_KEY);

export default async function handler (req, res) {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: req.body.customer,
      items: req.body.items,
      automatic_tax: {
        enabled: true,
      },
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice"],
    });
    res.status(200).json(subscription);
  } catch (error) {
    res.json({
      message: error.message,
      success: false,
    });
  }
}