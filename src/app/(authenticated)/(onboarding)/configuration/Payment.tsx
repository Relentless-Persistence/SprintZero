import { Button, Form, Input, List } from "antd"

import type { FC } from "react"

const Payment: FC = () => {
    return (
        <div className="flex">
            <div className="w-5/12"></div>
            <div className="w-2/12"></div>
            <div className="w-5/12">
                <Form className="mt-8" labelCol={{ span: 24 }}>
                    <h2 className="text-lg font-semibold">Credit card</h2>
                    <Form.Item name="email" label="Card number">
                        <Input type="email" placeholder="Enter your email" />
                    </Form.Item>
                    <Form.Item name="email" label="Name on card">
                        <Input type="email" placeholder="Enter your email" />
                    </Form.Item>
                    <div className="mb-0 flex flex-wrap">
                        <div className="w-2/3 pr-4">
                            <Form.Item name="firstName" label="Expiration date">
                                <Input placeholder="Enter your first name" />
                            </Form.Item>
                        </div>
                        <div className="w-1/3 pl-4">
                            <Form.Item name="lastName" label="Security code">
                                <Input placeholder="Enter your last name" />
                            </Form.Item>
                        </div>
                    </div>
                    <h2 className="text-lg font-semibold">Billing address</h2>
                </Form>
            </div>
        </div>
    )
}

export default Payment
