import React, { useState } from "react";
import styled from "styled-components";

import { Card, Input, Form, Space, Button, message } from "antd";

import CardHeaderButton from "../Dashboard/CardHeaderButton";
import { checkEmptyObject } from "../../utils";
import { divide } from "lodash";
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

const EditVision = ({ info, inEditMode, setEditMode }) => {
  // const initialValues = checkEmptyObject(info) ? init : info;
  const [targetCustomer, setTargetCustomer] = useState(info.targetCustomer);
  const [need, setNeed] = useState(info.need);
  const [keyBenefits, setKeyBenefits] = useState(info.keyBenefits);
  const [competitors, setCompetitors] = useState(info.competitors);
  const [differentiators, setDifferentiators] = useState(info.differentiators);

  // Update Vision
  const updateVision = async (id) => {
    const data = {
      targetCustomer,
      need,
      keyBenefits,
      competitors,
      differentiators,
    };
    await db
      .collection("Visions")
      .doc(id)
      .update(data)
      .then(() => {
        message.success("Vision updated successfully");
        setTargetCustomer("");
        setNeed("");
        setKeyBenefits("");
        setCompetitors("");
        setDifferentiators("");
        setEditMode(false);
      });
  };

  const onFinish = (values) => {
    handleSubmit(values);
  };

  // const validate = async () => {
  //   try {
  //     const values = await form.validateFields();
  //     onFinish(values);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const endEditMode = () => {
    setTargetCustomer("");
    setNeed("");
    setKeyBenefits("");
    setCompetitors("");
    setDifferentiators("");
    setEditMode(false);
  };

  return (
    <Card
      bordered={false}
      extra={
        <Space>
          <Button
            size="small"
            className="text-[#4A801D] text-xs ghost"
            onClick={() => endEditMode()}
          >
            Cancel
          </Button>
          <CardHeaderButton onClick={() => updateVision(info.id)}>
            Done
          </CardHeaderButton>
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
        onFinish={() => updateVision(info.id)}
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

export default EditVision;
