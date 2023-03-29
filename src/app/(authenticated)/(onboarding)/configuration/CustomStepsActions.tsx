import { loadStripe } from '@stripe/stripe-js';
import { Button } from 'antd';
import { useState } from "react";

import type { FC } from "react";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(`pk_test_VOOyyYjgzqdm8I3SrBqmh9qY`);

interface Props {
    currentStep: number;
    totalSteps: number;
    items: StepData[];
    onPrevious: () => void;
    onNext: () => void;
    onPaymentStatus?: (status: "process" | "wait" | "finish" | "error" | undefined) => void;
}

interface StepData {
    title: string
    description: string,
    status?: "process" | "wait" | "finish" | "error" | undefined,
    icon?: JSX.Element | undefined,
}

import type { PaymentIntent, Stripe } from 'stripe';

const handlePay = async () => {
    // Retrieve a Stripe instance from the stripePromise
    const stripe: Stripe = await stripePromise;

    // Create a payment intent for the customer's order
    const { data: { client_secret } }: PaymentIntent = await stripe.paymentIntents.create({
        amount: 1000, // amount in cents
        currency: `usd`,
        payment_method_types: [`card`],
    });

    // Use the client_secret to confirm the payment on the client side
    const { error } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
            card: {
                number: `4242424242424242`,
                exp_month: 12,
                exp_year: 24,
                cvc: `123`,
            },
        },
    });

    if (error) {
        console.log(error);
        return false
    } else {
        console.log(`Payment succeeded!`);
        return true
    }
};


const CustomStepsActions: FC = (props: Props) => {
    const { onPrevious, onNext, onPaymentStatus, currentStep, totalSteps } = props;
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === totalSteps - 1;
    const isFourthStep = currentStep === 3;
    const isFifthStep = currentStep === 4;

    const leftButtonText = isFirstStep ? `Cancel` : `Previous`;
    const rightButtonText = isFifthStep ? `Start` : isFourthStep ? `Pay` : `Next`;

    const handleNextButton = async () => {
        if (isLastStep) {
            // Handle Start button click
            console.log(`Start clicked`);
        }
        else if (isFourthStep) {
            // Handle Pay button click
            setIsProcessingPayment(true);
            onPaymentStatus(`process`);
            const paymentSuccessful = await handlePay();

            if (paymentSuccessful) {
                setIsProcessingPayment(false);
                onPaymentStatus(undefined);
                onNext();
            }
            else {
                setIsProcessingPayment(false);
                onPaymentStatus(`error`);
            }



            // setTimeout(() => {
            //     setIsProcessingPayment(false);
            //     onPaymentStatus(undefined);
            //     onNext();
            //     //onPayment();
            // }, 2000);
        }
        else {
            onNext();
        }
    };

    const handlePreviousButton = () => {
        if (isFirstStep) {
            // Handle Cancel button click
            console.log(`Cancel clicked`);
        }
        else {
            onPrevious();
        }
    };

    return (
        <div className="flex justify-between">
            <Button className="bg-white" onClick={handlePreviousButton}>
                {leftButtonText}
            </Button>
            <Button type="primary" onClick={handleNextButton}>
                {rightButtonText}
            </Button>
        </div>
    );
};

export default CustomStepsActions;
