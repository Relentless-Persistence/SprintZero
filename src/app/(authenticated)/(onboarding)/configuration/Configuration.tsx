import { Button, Divider, Form, Input } from "antd"

import type { FC } from "react"
import { useOnboardingContext } from "./OnboardingContext"

const Configuration: FC = () => {

    const { currentStep, setCurrentStep } = useOnboardingContext()
    const handlePreviousButton = () => {
        setCurrentStep(currentStep - 1)
    }
    const handleStartButton = async () => {
        //setCurrentStep(currentStep + 1)
        console.log('start clicked')
    }


    return (
        <>
            <div className="flex">
                <div className="w-1/2">
                    <div className="leading-normal mb-2">
                        <p className="text-lg font-medium">Product name</p>
                        <p className="text-base text-textTertiary">What are we gonna call this thing?</p>
                    </div>

                    <Input type="email" placeholder="Enter your email" />

                </div>
                {/* <div className="flex-none"><Divider type="vertical" /></div> */}
                <div className="w-1/2">
                    <div className="leading-normal mb-2">
                        <p className="text-lg font-medium">Product name</p>
                        <p className="text-base text-textTertiary">What are we gonna call this thing?</p>
                    </div>

                    <Input type="email" placeholder="Enter your email" />
                </div>

            </div>
            <div className="flex">
                <div className="w-full">
                    <div className="leading-normal mb-2">
                        <p className="text-lg font-medium">Team members</p>
                        <p className="text-base text-textTertiary">Who's gonna saddle up with you?</p>
                    </div>
                </div>
            </div>
            <div className="flex justify-between">
                <Button className="bg-white" onClick={handlePreviousButton}>
                    Previous
                </Button>
                <Button type="primary" onClick={handleStartButton}>
                    Start
                </Button>
            </div>
        </>
    )
}

export default Configuration