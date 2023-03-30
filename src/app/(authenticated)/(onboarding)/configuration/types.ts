import * as z from "zod"

const onboardingSchema = z.object({})

export const onboardingTierSchema = z.enum([`basic`, `professional`])

export const onboardingBillingInfoSchema = z.object({
	email: z.string().email(),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	streetAddress: z.string(),
	unitNumber: z.string().optional(),
	city: z.string(),
	country: z.string(),
	state: z.string(),
	postalCode: z.string(),
})

export const onboardingPaymentInfoSchema = z.object({
	couponCode: z.string().optional(),
	creditCardNumber: z.string().length(16),
	nameOnCard: z.string(),
	expirationDate: z.string().regex(/^\d{2}\/\d{2}$/),
	cvv: z.string().length(3),
})

export type OnboardingTier = z.infer<typeof onboardingTierSchema> | undefined
export type OnboardingBillingInfo = z.infer<typeof onboardingBillingInfoSchema> | undefined
export type OnboardingPaymentInfo = z.infer<typeof onboardingPaymentInfoSchema> | undefined
