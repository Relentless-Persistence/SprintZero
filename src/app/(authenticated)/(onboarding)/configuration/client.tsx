"use client"

import { CloseCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import { Button, Divider, Form, Steps } from "antd"
import { useState } from "react"

import type { FC } from "react";

import Configuration from "./Configuration"
import CustomStepsActions from "./CustomStepsActions";
import Finalize from "./Finalize"
import Information from "./Information"
import Payment from "./Payment"
import Tier from "./Tier"

interface StepData {
    title: string
    description: string,
    status?: "process" | "wait" | "finish" | "error" | undefined,
    icon?: JSX.Element | undefined,
}

const steps: StepData[] = [
    {
        title: `Tier`,
        description: `How many you got?`,
        status: undefined,
        icon: undefined
    },
    {
        title: `Information`,
        description: `Got those digits?`,
        status: undefined,
        icon: undefined
    },
    {
        title: `Payment`,
        description: `C.R.E.A.M`,
        status: undefined,
        icon: undefined
    },
    {
        title: `Finalize`,
        description: `Wrap it up B`,
        status: undefined,
        icon: undefined
    },
    {
        title: `Configuration`,
        description: `How you like it?`,
        status: undefined,
        icon: undefined
    },
]

const ConfigurationPageClientPage: FC = () => {
    const [currentStep, setCurrentStep] = useState<number>(0)
    const [paymentStatus, setPaymentStatus] = useState(`pending`);
    const [stepItems, setStepItems] = useState<StepData[]>(steps);

    const handleNext = () => {
        setCurrentStep(currentStep + 1)
    }

    const handlePrevious = () => {
        setCurrentStep(currentStep - 1)
    }

    const handlePaymentStatus = (status: "process" | "wait" | "finish" | "error" | undefined) => {
        console.log(`Payment status: ${status}`)
        const newSteps = [...steps];

        let statusIcon = undefined
        if (status === `process`)
            statusIcon = <LoadingOutlined />;
        else if (status === `error`)
            statusIcon = <CloseCircleOutlined />

        newSteps[3] = {
            ...newSteps[3],
            status,
            icon: undefined,
        };
        setStepItems(newSteps);
    };

    const stepsContent = [
        <Tier key="tier-step" />,
        <Information key="information-step" />,
        <Payment key="payment-step" />,
        <Finalize key="finalize-step" />,
        <Configuration key="configuration-step" />,
    ]

    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="leading-normal">
                <h1 className="text-5xl font-semibold">Sorry...but we gotta keep the lights on</h1>
                <p className="text-lg text-textSecondary">
                    Please provide your information below so we can keep our internet overlords happy
                </p>
            </div>
            <Steps size="small" current={currentStep} items={stepItems} />
            {stepsContent[currentStep]}
            <CustomStepsActions
                currentStep={currentStep}
                totalSteps={5}
                onPrevious={handlePrevious}
                onNext={handleNext}
                items={stepItems}
                onPaymentStatus={handlePaymentStatus}
            />
        </div>
    )
}

export default ConfigurationPageClientPage
