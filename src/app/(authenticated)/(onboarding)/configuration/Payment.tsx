import { Button, Form, Input, List } from "antd"

import type { FC } from "react"
import { useOnboardingContext } from "./OnboardingContext"

const Payment: FC = () => {

    const { currentStep, setCurrentStep } = useOnboardingContext()

    const handlePreviousButton = () => {
        setCurrentStep(currentStep - 1)
    }
    const handleNextButton = async () => {
        setCurrentStep(currentStep + 1)
    }

    return (
        <>
            <div className="flex">
                <div className="w-5/12"></div>
                <div className="w-2/12"></div>
                <div className="w-5/12">
                    <Form className="mt-8" labelCol={{ span: 24 }}>
                        <h2 className="text-lg font-semibold">Credit card</h2>
                        <Form.Item name="email" label="Card number">
                            <Input type="email" placeholder="5555 5555 5555 5555" />
                        </Form.Item>
                        <Form.Item name="name" label="Name on card">
                            <Input placeholder="First Last" />
                        </Form.Item>
                        <div className="mb-0 flex flex-wrap">
                            <div className="w-2/3 pr-4">
                                <Form.Item name="firstName" label="Expiration date">
                                    <Input placeholder="Select date" />
                                </Form.Item>
                            </div>
                            <div className="w-1/3 pl-4">
                                <Form.Item name="lastName" label="Security code">
                                    <Input placeholder="123" />
                                </Form.Item>
                            </div>
                        </div>
                        <h2 className="text-lg font-semibold">Billing address</h2>
                    </Form>
                </div>
            </div>
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

export default Payment
