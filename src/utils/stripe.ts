// import Stripe from "stripe"
// import firebase from "firebase/app"
// import "firebase/auth"

// const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, {
// 	apiVersion: `2020-08-27`,
// })

// export const createStripeCustomer = async (uid: string): Promise<string> => {
// 	const firebaseUser = await firebase.auth().getUser(uid)
// 	const customer = await stripe.customers.create({
// 		email: firebaseUser.email,
// 		metadata: {
// 			firebase_uid: firebaseUser.uid,
// 		},
// 	})

// 	return customer.id
// }
