import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import type { FC } from "react"
import Billing from "./Billing";
import { useOnboardingContext } from "./OnboardingContext";
import { Button } from "antd";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const Finalize: FC = () => {


    const { currentStep, setCurrentStep } = useOnboardingContext()

    const handlePreviousButton = () => {
        setCurrentStep(currentStep - 1)
    }
    const handleNextButton = async () => {
        setCurrentStep(currentStep + 1)
    }

    return (
        <>
            <Elements stripe={stripePromise}>
                <Billing />
            </Elements>
            <div className="flex justify-between">
                <Button className="bg-white" onClick={handlePreviousButton}>
                    Previous
                </Button>
                <Button type="primary" onClick={handleNextButton}>
                    Next
                </Button>
            </div>
        </>
    )
}

export default Finalize