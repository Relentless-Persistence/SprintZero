import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
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
  message
} from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import { getPayment } from "../contexts/PaymentContext";

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

const Billing = ({ selectedPlan, countries }) => {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [zip, setZip] = useState("");
  const [success, setSuccess] = useState(false);

  const stripe = useStripe();
  const elements = useElements();

  const tax = 6.25;

  const handleSubmit = async (e) => {
    e.preventDefault();

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
          amount: (selectedPlan === "Basic" ? 9.99 : 99.99) * 100,
          id,
        });

        if (response.data.success) {
          getPayment(true);
          message.success("Successful payment");
          setTimeout(() => {
            router.push('/login')
          }, 3000);
          setSuccess(true);
        }
      } catch (error) {
        message.error("Error", error);
      }
    } else {
      console.log(error.message);
    }
  };

  const getTax = () => {
    const price = selectedPlan === "Basic" ? 9.99 : 99.99
    return Math.round(((price * (tax/100)) + Number.EPSILON) * 100) / 100;
  }

  const totalPrice = () => {
    const price = selectedPlan === "Basic" ? 9.99 : 99.99;
    const tax = getTax();
    return Math.round(((price + tax) + Number.EPSILON) * 100) / 100;
  }

  return (
    selectedPlan && (
      <>
        <div className="mb-4">
          <Title level={1} style={{ fontWeight: "normal" }}>
            Hand Over Those Deets
          </Title>
          <Text className="text-xl">
            Please provide your information below so we can keep our internet
            service providers happy and continue to evolve this product
          </Text>
        </div>

        <form onSubmit={handleSubmit}>
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

              <Col xs={24} sm={24} lg={6}>
                <Item
                  label={
                    <Text className="flex items-center justify-between text-sm">
                      Country <QuestionCircleOutlined className="ml-2 mr-2" />
                    </Text>
                  }
                  name="country"
                >
                  <div className="flex">
                    <Select
                      style={{ width: "100%" }}
                      onChange={(e) => setCountry(e)}
                    >
                      {countries.map((country, i) => (
                        <Option key={i} value={country.Iso2}>
                          {country.name}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </Item>
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
              <Text className="text-xl">Sales Tax @ {tax}%</Text>
              <Text className="text-xl">${getTax()} USD</Text>
            </Col>
            <Divider className="bg-gray-900" />
            <Col className="flex items-center justify-between mt-4">
              <Text className="text-xl font-semibold">Total</Text>
              <Text className="text-xl font-semibold">${totalPrice()} USD</Text>
            </Col>
            <Col className="flex items-center justify-start mt-4 mb-8">
              <Checkbox />
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
                <Button type="primary" htmlType="submit" block>
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
        </form>
      </>
    )
  );
};

export default Billing;
