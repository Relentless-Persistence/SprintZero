import { z } from "zod"

import { genConverter } from ".."

export const BillingSchema = z.object({
    billingOwner: z.string(),
    billingEmail: z.string().optional(),
    subscriptionId: z.string()
})

export type Billing = z.infer<typeof BillingSchema>
export const BillingConverter = genConverter(BillingSchema)
