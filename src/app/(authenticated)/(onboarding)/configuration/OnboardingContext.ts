import {createContext, useContext} from "react"

import type {OnboardingBillingInfo, OnboardingPaymentInfo, OnboardingTier} from "./types"
import type {QuerySnapshot} from "firebase/firestore"
import type {Dispatch, SetStateAction} from "react"

// import type {StoryMapItem} from "~/types/db/Products/StoryMapItems"
// import type {Version} from "~/types/db/Products/Versions"

export const OnboardingContext = createContext<{
	currentStep: number
	setCurrentStep: Dispatch<SetStateAction<number>>
	tier: OnboardingTier
	setTier: Dispatch<SetStateAction<OnboardingTier>>
	billingInfo: OnboardingBillingInfo
	setContactInfo: Dispatch<SetStateAction<OnboardingBillingInfo>>
	paymentInformation: OnboardingPaymentInfo
	setPaymentInfo: Dispatch<SetStateAction<OnboardingPaymentInfo>>
}>(undefined as never)

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useOnboardingContext = () => useContext(OnboardingContext)
