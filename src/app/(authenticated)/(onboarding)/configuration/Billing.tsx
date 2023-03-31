import React, { useState, useEffect } from "react";
import type { FC } from "react";
import { useRouter } from "next/navigation";
import {
    Typography,
    Row,
    Col,
    Button,
    Input,
    Form,
    Select,
    Divider,
    Checkbox,
    message,
} from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
//import { getPayment } from "./PaymentContext";
import Stripe from "stripe";

const { Title, Text } = Typography;
const { Item } = Form;
const { Option } = Select;

const card_options = {
    hidePostalCode: true,
    iconStyle: "solid",
    style: {
        base: {
            iconColor: "#000",
            color: "#000",
            fontWeight: 400,
            fontFamily: "Roboto, Open Sans, Segoe Ui, sans-serif",
            fontSize: "14px",
            "::placeholder": { color: "#A6AE9D" },
        },
        invalid: {
            iconColor: "red",
            color: "red",
        },
    },
};

const Billing: FC = () => {

    const selectedPlan = 'Basic'
    const countries = ['US', 'Netherlands']
    const ip = ''

    const router = useRouter();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [country, setCountry] = useState("");
    const [zip, setZip] = useState("");
    const [terms, setTerms] = useState(false);
    const [success, setSuccess] = useState(false);
    const [submitButton, setSubmitButton] = useState(true);
    const [taxInfo, setTaxInfo] = useState(true);
    //const [taxInfo, setTaxInfo] = useState(null);
    const [customer, setCustomer] = useState(null);

    const stripe = useStripe();
    const elements = useElements();

    useEffect(() => {
        const customer = async () => {
            const res = await axios.post("/api/create_customer", {
                ip
            });
            setCustomer(res.data);
            console.log(res.data);
        }
        customer();
    }, [])

    function validateEmail(mail) {
        const re =
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(mail);
    }

    const handleSubmit = async (e) => {
        setSubmitButton(true);
        //const totalPrice = (Math.round(((selectedPlan === "Basic" ? 9.99 : 99.99) * (taxInfo.total_tax_amounts[0].tax_rate.percentage / 100) + Number.EPSILON) * 100) / 100) * 100;
        const totalPrice = (Math.round(((selectedPlan === "Basic" ? 9.99 : 99.99) + Number.EPSILON) * 100) / 100) * 100;

        if (validateEmail(email) === true && terms && country) {
            const billingDetails = {
                name: `${firstName} ${lastName}`,
                email,
                address: {
                    country,
                    postal_code: zip,
                },
            };

            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: "card",
                card: elements.getElement(CardElement),
                billing_details: billingDetails,
            });

            if (!error) {
                try {
                    const { id } = paymentMethod;
                    const response = await axios.post("/api/payment_intents", {
                        amount: 0.99,
                        id,
                    });

                    if (response.data.success) {
                        getPayment(true);
                        message
                            .loading(
                                { content: "Running Card", className: "custom-message" },
                                2.5
                            )
                            .then(() =>
                                message.success({
                                    content: "Card Accepted",
                                    className: "custom-message",
                                })
                            );
                        setTimeout(() => {
                            router.push("/login");
                        }, 4000);
                        setSuccess(true);
                    }
                } catch (error) {
                    message
                        .loading(
                            { content: "Running Card", className: "custom-message" },
                            2.5
                        )
                        .then(() =>
                            message.error({
                                content: error.message,
                                className: "custom-message",
                            })
                        );
                    setSubmitButton(false);
                }
            } else {
                message
                    .loading(
                        { content: "Validating...", className: "custom-message" },
                        2.5
                    )
                    .then(() =>
                        message.error({
                            content: error.message,
                            className: "custom-message",
                        })
                    );
                setSubmitButton(false);
            }
        } else {
            message
                .loading({ content: "Validating...", className: "custom-message" }, 2.5)
                .then(() =>
                    message.error({
                        content: "Details missing",
                        className: "custom-message",
                    })
                );
            setSubmitButton(false);
        }
    };

    const handleTax = async (e) => {
        const price =
            selectedPlan === "Basic"
                ? "price_1JsrIXIUry2flRTckRVmn2LJ"
                : "price_1JsrIyIUry2flRTca7f6zJ8N";

        const subscription = await axios.post("/api/create_subscription", {
            customer: customer.id,
            items: [
                {
                    price: "price",
                    quantity: 1,
                },
            ],
        });

        console.log(subscription);

        const response = await axios.post("/api/upcoming_invoice", {
            customer: customer.id,
            country: e,
            postal_code: zip,
            subscription_items: [
                {
                    price: price,
                    quantity: 1,
                },
            ],
            ip,
        });

        if (response.status === 200) {
            setTaxInfo(response.data);
            console.log(response.data);
            console.log(response.data.total_tax_amounts);
        } else {
            console.log(response.data.message);
        }
    };

    const getTax = (tax) => {
        const price = selectedPlan === "Basic" ? 9.99 : 99.99;
        return Math.round((price * (tax / 100) + Number.EPSILON) * 100) / 100;
    };

    const totalPrice = (tax) => {
        const price = selectedPlan === "Basic" ? 9.99 : 99.99;
        return Math.round((price + tax + Number.EPSILON) * 100) / 100;
    };

    const handleTerms = () => {
        if (taxInfo) {
            setTerms(!terms);
            if (terms) {
                setSubmitButton(true);
            } else {
                setSubmitButton(false);
            }
        }
    }

    return (
        selectedPlan && (
            <>
                <Form onFinish={handleSubmit}>
                    <div>
                        <Text
                            className="text-gray-500 font-semibold"
                            style={{ fontSize: "16px" }}
                        >
                            Contact Information
                        </Text>
                        <Row gutter={[16, 16]} className="mt-4">
                            <Col xs={24} sm={24} lg={14}>
                                <Item
                                    label={
                                        <Text className="flex items-center justify-between text-sm">
                                            Full Name <QuestionCircleOutlined className="ml-2 mr-2" />
                                        </Text>
                                    }
                                    name="fullName"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please input your full name!",
                                        },
                                    ]}
                                >
                                    <div className="flex">
                                        <Input
                                            placeholder="First"
                                            onChange={(e) => setFirstName(e.target.value)}
                                        />
                                        <Input
                                            className="ml-2"
                                            placeholder="Last"
                                            onChange={(e) => setLastName(e.target.value)}
                                        />
                                    </div>
                                </Item>
                            </Col>

                            <Col xs={24} sm={24} lg={10}>
                                <Item
                                    label={
                                        <Text className="flex items-center justify-between text-sm">
                                            Email <QuestionCircleOutlined className="ml-2 mr-2" />
                                        </Text>
                                    }
                                    name="email"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please input your email!",
                                        },
                                    ]}
                                >
                                    <Input onChange={(e) => setEmail(e.target.value)} />
                                </Item>
                            </Col>
                        </Row>
                    </div>

                    <div>
                        <Text
                            className="text-gray-500 font-semibold"
                            style={{ fontSize: "16px" }}
                        >
                            Credit Card Details
                        </Text>

                        <Row gutter={[16, 16]} className="mt-4">
                            <Col xs={24} sm={24} lg={10}>
                                <div className="py-2 px-3 bg-white border border-gray-300 rounded-sm">
                                    <CardElement options={card_options} />
                                </div>
                            </Col>

                            <Col xs={24} sm={24} lg={8}>
                                <Item
                                    label={
                                        <Text className="flex items-center justify-between text-sm">
                                            ZIP/Postal Code{" "}
                                            <QuestionCircleOutlined className="ml-2 mr-2" />
                                        </Text>
                                    }
                                    name="zip"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please input your zip/postal code",
                                        },
                                    ]}
                                >
                                    <Input onChange={(e) => setZip(e.target.value)} />
                                </Item>
                            </Col>

                            <Col xs={24} sm={24} lg={6}>
                                <Item
                                    label={
                                        <Text className="flex items-center justify-between text-sm">
                                            <span className="text-red-500 text-lg">*</span>Country{" "}
                                            <QuestionCircleOutlined className="ml-2 mr-2" />
                                        </Text>
                                    }
                                    name="country"
                                >
                                    <div className="flex">
                                        <Select
                                            style={{ width: "100%" }}
                                            onChange={(e) => {
                                                setCountry(e);
                                                handleTax(e);
                                            }}
                                            disabled={zip === "" ? true : false}
                                        >
                                            {countries.map((country, i) => (

                                                <Option key={i} value='NL'>
                                                    {country}
                                                </Option>
                                            ))}
                                        </Select>
                                    </div>
                                </Item>
                            </Col>
                        </Row>
                    </div>

                    <div>
                        <Text
                            className="text-gray-500 font-semibold"
                            style={{ fontSize: "16px" }}
                        >
                            Selected Plan
                        </Text>
                        <Col className="flex items-center justify-between">
                            <Text className="text-xl">{selectedPlan}</Text>
                            <Text className="text-xl">
                                ${selectedPlan === "Basic" ? 9.99 : 99.99} USD
                            </Text>
                        </Col>
                        <Col className="flex items-center justify-between mt-4">
                            {/* <Text className="text-xl">
                                Sales Tax @{" "}
                                {taxInfo
                                    ? taxInfo.total_tax_amounts[0].tax_rate.percentage
                                    : "-"}
                                %
                            </Text>

                            <Text className="text-xl">
                                $
                                {taxInfo
                                    ? getTax(taxInfo.total_tax_amounts[0].tax_rate.percentage)
                                    : "-"}{" "}
                                USD
                            </Text> */}
                        </Col>
                        <Divider className="bg-gray-900" />
                        <Col className="flex items-center justify-between mt-4">
                            <Text className="text-xl font-semibold">Total</Text>
                            {/* <Text className="text-xl font-semibold">
                                $
                                {taxInfo
                                    ? totalPrice(taxInfo.total_tax_amounts[0].tax_rate.percentage)
                                    : selectedPlan === "Basic"
                                        ? 9.99
                                        : 99.99}{" "}
                                USD
                            </Text> */}
                        </Col>
                        <Col className="flex items-center justify-start mt-4 mb-8">
                            <Checkbox checked={terms} onChange={() => handleTerms()} />
                            <Text className="ml-4">
                                I agree to the{" "}
                                <span className="underline cursor-pointer">
                                    Terms of Service
                                </span>{" "}
                                and ackowledge the{" "}
                                <span className="underline cursor-pointer">Privacy Policy</span>
                                .
                            </Text>
                        </Col>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} lg={12}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    block
                                    disabled={submitButton}
                                >
                                    <span className="font-semibold">Submit</span>
                                </Button>
                            </Col>
                            <Col xs={24} lg={12}>
                                <Button
                                    danger
                                    type="ghost"
                                    block
                                    onClick={() => router.push("/")}
                                >
                                    <span className="font-semibold">Cancel</span>
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </Form>
            </>
        )
    );
};

export default Billing;