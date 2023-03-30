import { Button } from 'antd';
import { useState } from "react";

import type { FC } from "react";

interface Props {
    currentStep: number;
    totalSteps: number;
    items: StepData[];
    onPrevious: () => void;
    onNext: () => void;
    onPaymentStatus?: (status: "process" | "wait" | "finish" | "error" | undefined) => void;
    formData: any;
}

interface StepData {
    title: string
    description: string,
    status?: "process" | "wait" | "finish" | "error" | undefined,
    icon?: JSX.Element | undefined,
}

import type { PaymentIntent, Stripe } from 'stripe';

import { useOnboardingContext } from './OnboardingContext';

const CustomStepsActions: FC = (props: Props) => {
    const { onPrevious, onNext, onPaymentStatus, currentStep, totalSteps, formData } = props;
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const [] = useOnboardingContext();

    const isFirstStep = currentStep === 0;
    const isSecondStep = currentStep === 1;
    const isThirdStep = currentStep === 2;
    const isLastStep = currentStep === totalSteps - 1;
    const isFourthStep = currentStep === 3;
    const isFifthStep = currentStep === 4;

    const leftButtonText = isFirstStep ? `Cancel` : `Previous`;
    const rightButtonText = isFifthStep ? `Start` : isFourthStep ? `Pay` : `Next`;

    const handleNextButton = async () => {
        if (isFirstStep) {

            onNext();
        }
        else if (isLastStep) {
            // Handle Start button click
            console.log(`Start clicked`);
        }
        else if (isThirdStep) {
            console.log(`formData hehe`, formData);

            onNext();
        }
        else if (isFourthStep) {
            // Handle Pay button click
            let paymentSuccessful = false;
            setIsProcessingPayment(true);
            onPaymentStatus(`process`);
            setTimeout(() => {
                setIsProcessingPayment(false);
                onPaymentStatus(undefined);
                paymentSuccessful = true;
                onNext();
                //onPayment();
            }, 2000);

            if (paymentSuccessful) {
                setIsProcessingPayment(false);
                onPaymentStatus(undefined);
                onNext();
            }
            else {
                setIsProcessingPayment(false);
                onPaymentStatus(`error`);
            }
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
            <Button htmlType='submit' className="bg-white" onClick={handlePreviousButton}>
                {leftButtonText}
            </Button>
            <Button htmlType='submit' type="primary" onClick={handleNextButton}>
                {rightButtonText}
            </Button>
        </div>
    );
};

export default CustomStepsActions;
