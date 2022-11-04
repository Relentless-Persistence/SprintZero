import React, { useState } from "react";
import styled from "styled-components";

import { Card, Input, Form, Space, message, Button } from "antd";

import CardHeaderButton from "../Dashboard/CardHeaderButton";
import { checkEmptyObject } from "../../utils";
import { db } from "../../config/firebase-config";

const FormItem = styled(Form.Item)`
  margin-bottom: 24px;
`;

const test = () => alert("lol");

const layout = {
  labelCol: { span: 4 },
};

const init = {
  targetCustomer: "",
  need: "",
  keyBenefits: "",
  competitors: "",
  differentiators: "",
};

const StatementForm = ({ activeProduct, setAddMode }) => {
  const [form] = Form.useForm();
  const [targetCustomer, setTargetCustomer] = useState("");
  const [need, setNeed] = useState("");
  const [keyBenefits, setKeyBenefits] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [differentiators, setDifferentiators] = useState("");

  const onReset = () => {
    form.resetFields();
  };

  const onFinish = (values) => {
    handleSubmit(values);
  };

  const validate = async () => {
    try {
      const values = await form.validateFields();
      onFinish(values);
    } catch (error) {
      console.error(error);
    }
  };

  // Create Vision
  const addVision = () => {
    const data = {
      createdAt: new Date().toISOString(),
      product_id: activeProduct.id,
      targetCustomer,
      need,
      keyBenefits,
      competitors,
      differentiators,
    };

    db.collection("Visions")
      .add(data)
      .then((docRef) => {
        message.success("New vision added successfully");
        setTargetCustomer("");
        setNeed("");
        setKeyBenefits("");
        setCompetitors("");
        setDifferentiators("");
        setAddMode(false);
      })
      .catch((error) => {
        message.error("Error adding vision");
      });
  };

  return (
    <Card
      type="inner"
      className="border border-[#D9D9D9]"
      extra={
        <Space>
          <Button
            className="text-[#4A801D] text-xs ghost"
            size="small"
            onClick={() => setAddMode(false)}
          >
            Cancel
          </Button>
          <CardHeaderButton onClick={() => addVision()}>Done</CardHeaderButton>
        </Space>
      }
      title="Guiding Statement"
    >
      <Form
        labelCol={{
          span: 6,
        }}
        wrapperCol={{
          span: 24,
        }}
        form={form}
        onFinish={onFinish}
      >
        <Form.Item
          label="Target Customer"
          tooltip="Identify the target of this product"
          rules={[
            {
              required: true,
              message: "Please input the target customer",
            },
          ]}
        >
          <Input
            placeholder="Reviewer, Recorder, etc"
            value={targetCustomer}
            onChange={(e) => setTargetCustomer(e.target.value)}
          />
        </Form.Item>

        <Form.Item
          label="Need"
          tooltip="Identify the need of this product"
          rules={[
            {
              required: true,
              message: "Please input the product need",
            },
          ]}
        >
          <Input
            placeholder="eg File taxes"
            value={need}
            onChange={(e) => setNeed(e.target.value)}
          />
        </Form.Item>

        <Form.Item
          label="Key Benefits"
          tooltip="Identify the key benefits of this product"
          rules={[
            {
              required: true,
              message: "Please input the key benefits",
            },
          ]}
        >
          <Input
            placeholder="Fast, Cheap"
            value={keyBenefits}
            onChange={(e) => setKeyBenefits(e.target.value)}
          />
        </Form.Item>

        <Form.Item
          label="Competitors"
          tooltip="Identify the competitors for this product"
          rules={[
            {
              required: true,
              message: "Please input at least one competitor",
            },
          ]}
        >
          <Input
            placeholder="Turbotax"
            value={competitors}
            onChange={(e) => setCompetitors(e.target.value)}
          />
        </Form.Item>

        <Form.Item
          label="Differentiators"
          tooltip="What makes your the product different?"
          rules={[
            {
              required: true,
              message: "Please input the at least one difference",
            },
          ]}
        >
          <Input
            placeholder="Faster, Cheaper"
            value={differentiators}
            onChange={(e) => setDifferentiators(e.target.value)}
          />
        </Form.Item>
      </Form>
    </Card>
  );
};

export default StatementForm;
