import { Divider, Form, Input } from "antd";

import type { FC } from "react";

const Information: FC = () => {
    return (
        <div className="flex">
            <div className="w-2/6"></div>
            <div className="w-1/6"><Divider plain>OR</Divider></div>
            <div className="w-3/6">
                <Form className="mt-8" labelCol={{ span: 24 }}>
                    <h2 className="text-lg font-semibold">Contact Information</h2>
                    <Form.Item name="email" label="Email Address">
                        <Input type="email" placeholder="Enter your email" />
                    </Form.Item>
                    <h2 className="text-lg font-semibold mt-4">Home Address</h2>
                    <div className="flex flex-wrap mb-0">
                        <div className="w-full md:w-1/2 mb-4 md:mb-0 pr-4">
                            <Form.Item name="firstName" label="First Name">
                                <Input placeholder="Enter your first name" />
                            </Form.Item>
                        </div>
                        <div className="w-full md:w-1/2 mb-4 md:mb-0 pl-4">
                            <Form.Item name="lastName" label="Last Name">
                                <Input placeholder="Enter your last name" />
                            </Form.Item>
                        </div>
                        <div className="w-full md:w-4/5 mb-4 md:mb-0 pr-3">
                            <Form.Item name="streetAddress" label="Street Address">
                                <Input placeholder="Enter your street address" />
                            </Form.Item>
                        </div>
                        <div className="w-full md:w-1/5 mb-4 md:mb-0">
                            <Form.Item name="unit" label="Unit #">
                                <Input placeholder="Unit #" />
                            </Form.Item>
                        </div>
                        <div className="w-full">
                            <Form.Item name="city" label="City">
                                <Input type="city" placeholder="Enter your city" />
                            </Form.Item>
                        </div>
                        <div className="w-3/6 pr-3">
                            <Form.Item name="country" label="Country / Region">
                                <Input placeholder="Country / Region" />
                            </Form.Item>
                        </div>
                        <div className="w-2/6 pr-3">
                            <Form.Item name="state" label="State / Province">
                                <Input placeholder="State / Province" />
                            </Form.Item>
                        </div>
                        <div className="w-1/6 pr-3">
                            <Form.Item name="postalCode" label="Postal Code">
                                <Input placeholder="Postal Code" />
                            </Form.Item>
                        </div>
                    </div>
                </Form>
            </div>
        </div>
    )
}

export default Information;