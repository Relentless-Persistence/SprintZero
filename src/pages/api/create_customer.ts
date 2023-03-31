import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET);

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