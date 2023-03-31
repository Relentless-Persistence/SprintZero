import {createContext, useContext} from "react"

import type {OnboardingBillingInfo, OnboardingPaymentInfo, OnboardingTier} from "./types"
import type {Dispatch, SetStateAction} from "react"

export const OnboardingContext = createContext<{
	currentStep: number
	setCurrentStep: Dispatch<SetStateAction<number>>
	tier: OnboardingTier
	setTier: Dispatch<SetStateAction<OnboardingTier>>
	billingInfo: OnboardingBillingInfo
	setBillingInfo: Dispatch<SetStateAction<OnboardingBillingInfo>>
	paymentInfo: OnboardingPaymentInfo
	setPaymentInfo: Dispatch<SetStateAction<OnboardingPaymentInfo>>
}>(undefined as never)

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useOnboardingContext = () => useContext(OnboardingContext)
