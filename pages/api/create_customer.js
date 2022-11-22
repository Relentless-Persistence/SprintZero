import Stripe from "stripe";
import { NEXT_PUBLIC_SECRET_KEY } from "../../config";

const stripe = new Stripe(NEXT_PUBLIC_SECRET_KEY);

export default async function handler(req, res) {
  try {
    const {ip} = req.body;
    const customer = await stripe.customers.create({
      description: "A new user",
      tax: {
        ip_address: ip,
      },
      expand: ["tax"],
    });
    res.status(200).json(customer);
  } catch (error) {
    res.json({
      message: error.message,
      success: false,
    });
  }
}
