import { Button, Divider, Input } from "antd"
import { useForm } from "react-hook-form"

import type { FC } from "react"

import { useOnboardingContext } from "./OnboardingContext"
import { OnboardingBillingInfo, onboardingBillingInfoSchema } from "./types"

const Information: FC = () => {
    const { register, handleSubmit } = useForm()
    const { currentStep, setCurrentStep } = useOnboardingContext()

    const handlePreviousButton = () => {
        setCurrentStep(currentStep - 1)
    }
    const handleNextButton = () => {
        setCurrentStep(currentStep + 1)
    }

    return (
        <>
            <div className="flex">
                <div className="w-2/6"></div>
                <div className="w-1/6">
                    <Divider plain>OR</Divider>
                </div>
                <div className="w-3/6">
                    <h2 className="text-lg font-semibold">Contact Information</h2>
                    <Input type="email" placeholder="Enter your email" {...register(`email`)} />
                    <h2 className="mt-4 text-lg font-semibold">Home Address</h2>
                    <div className="mb-0 flex flex-wrap">
                        <div className="mb-4 w-full pr-4 md:mb-0 md:w-1/2">
                            <Input placeholder="Enter your first name" {...register(`firstName`)} />
                        </div>
                        <div className="mb-4 w-full pl-4 md:mb-0 md:w-1/2">
                            <Input placeholder="Enter your last name" {...register(`lastName`)} />
                        </div>
                        <div className="mb-4 w-full pr-3 md:mb-0 md:w-4/5">
                            <Input placeholder="Enter your street address" {...register(`streetAddress`)} />
                        </div>
                        <div className="mb-4 w-full md:mb-0 md:w-1/5">
                            <Input placeholder="Unit #" {...register(`unitNumber`)} />
                        </div>
                        <div className="w-full">
                            <Input type="city" placeholder="Enter your city" {...register(`city`)} />
                        </div>
                        <div className="w-3/6 pr-3">
                            <Input placeholder="Country / Region" {...register(`country`)} />
                        </div>
                        <div className="w-2/6 pr-3">
                            <Input placeholder="State / Province" {...register(`state`)} />
                        </div>
                        <div className="w-1/6 pr-3">
                            <Input placeholder="Postal Code" {...register(`postalCode`)} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-between">
                <Button className="bg-white" onClick={handlePreviousButton}>
                    Previous
                </Button>
                <Button type="primary" onClick={async () => {
                    const data = await handleSubmit(handleNextButton)();
                }}>
                    Next
                </Button>
            </div>
        </>
    )
}

export default Information
