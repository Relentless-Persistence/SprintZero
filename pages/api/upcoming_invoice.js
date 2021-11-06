import Stripe from "stripe";

const stripe = new Stripe(process.env.NEXT_PUBLIC_SECRET_KEY);

export default async function handler(req, res) {
  try {
    const invoice = await stripe.invoices.retrieveUpcoming({
      automatic_tax: {
        enabled: true,
      },
      customer_details: {
        address: {
          country: req.body.country,
          postal_code: req.body.postal_code,
        },
      },
      subscription_items: req.body.subscription_items,
      expand: ["total_tax_amounts.tax_rate"],
      customer: req.body.customer,
    });
    res.status(200).json(invoice);
  } catch (error) {
    res.json({
      message: error.message,
      success: false,
    });
  }
}
