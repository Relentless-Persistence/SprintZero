import Stripe from "stripe";
import { NEXT_PUBLIC_SECRET_KEY } from "../../config";

const stripe = new Stripe(NEXT_PUBLIC_SECRET_KEY);

export default async function handler(req, res) {

    try {
      const { amount, id } = req.body;

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        payment_method: id,
        confirm: true,
      });

      // console.log("Payment", paymentIntent);
      res.json({
        message: "Payment successful",
        success: true,
      });
    } catch (err) {
      // console.log("Error", err);
      res.json({
        message: "Payment failure",
        success: false,
      });
    }
};
