const stripe = require('stripe')(process.env.STRIPE_SECRET);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Create Checkout Sessions from body params.
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
            price: 'price_1JsrIXIUry2flRTckRVmn2LJ',
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${req.headers.origin}/configuration/?paymentSuccess=true`,
        cancel_url: `${req.headers.origin}/configuration/?paymentCanceled=true`,
        automatic_tax: {enabled: true},
      });
      res.redirect(303, session.url);
    } catch (err) {
      res.status(err.statusCode || 500).json(err.message);
    }
  }
  else if (req.method === 'POST' && req.body.type === 'checkout.session.completed') {
    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(req.body.data.object.id);

    // Extract the customer's entered email address from the checkout session object
    const customerEmail = session.customer_details.email;

    // Update the customer_email parameter of the checkout session with the entered email address
    await stripe.checkout.sessions.update(session.id, { customer_email: customerEmail });

    // Send a confirmation email to the customer
    // ...

    // Return a success response to Stripe
    res.status(200).json({ received: true });
  } 
   else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}