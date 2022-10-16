import React, { useState } from "react";

import styled from "styled-components";

import { Card, Input, Space, Button } from "antd";

import CardHeaderButton, { CardHeaderLink } from "./CardHeaderButton";
import ActionButtons, { LightActionButtons } from "../Personas/ActionButtons";

const { TextArea } = Input;

const MyCard = styled(Card)`
  .ant-card-head {
    min-height: unset;
    padding: 0 12px;
    border-bottom: 2px solid #d9d9d9;
  }

  .ant-card-head-title {
    padding: 0;
  }

  .ant-card-body {
    padding: 12px;
  }
`;

export default function FormCard({
  isEdit,
  extra,
  itemToEdit,
  extraItems,
  onSubmit,
  className,
  headerSmall = false,
  onCancel,
}) {
  const [item, setItem] = useState(
    isEdit
      ? { ...itemToEdit }
      : {
          name: "",
          description: "",
        }
  );

  const handleChange = (e, key) => {
    const { value } = e.target;

    setItem({
      ...item,
      [key]: value,
    });
  };

  const handleSubmit = () => {
    if (isEdit) {
      onSubmit({
        name: item.name || itemToEdit.name,
        description: item.description || itemToEdit.description,
      });
    } else {
      onSubmit(item);
    }
  };

  return headerSmall ? (
    <MyCard
      className={className}
      bordered={false}
      extra={
        extra ? (
          extra
        ) : (
          <Space>
            <CardHeaderLink onClick={onCancel}>Cancel</CardHeaderLink>
            <Button className="ml-2" onClick={handleSubmit}>
              Done
            </Button>
          </Space>
        )
      }
      title={
        <Input
          value={item.name}
          onChange={(e) => handleChange(e, "name")}
          placeholder="Result name..."
        />
      }
      headStyle={{
        background: "#F5F5F5",
      }}
    >
      <TextArea
        autoSize={{ minRows: 6 }}
        value={item.description}
        onChange={(e) => handleChange(e, "description")}
        placeholder="Result description..."
      />

      {extraItems}
    </MyCard>
  ) : (
    <Card
      className={className}
      bordered={false}
      extra={
        extra ? (
          extra
        ) : (
          <Space>
            <CardHeaderLink onClick={onCancel}>Cancel</CardHeaderLink>
            <Button className="ml-2" danger ghost onClick={handleSubmit}>
              Done
            </Button>
          </Space>
        )
      }
      title={
        <Input
          value={item.name}
          onChange={(e) => handleChange(e, "name")}
          placeholder="Result name..."
        />
      }
      headStyle={{
        background: "#F5F5F5",
      }}
    >
      <TextArea
        autoSize={{ minRows: 6 }}
        value={item.description}
        onChange={(e) => handleChange(e, "description")}
        placeholder="Result description..."
      />
      {extraItems}
      <Button disabled block className="bg-[#FF4D4F] text-white mt-2">
        Remove
      </Button>
    </Card>
  );
}

export const ActionFormCard = ({
  title,
  description,
  id,
  useAction = true,
  version = 1,
  onSubmit,
  onCancel,
  className,
  extraItems,
  headerSmall = false,
  onDelete,
}) => {
  const [item, setItem] = useState({
    title,
    description,
  });

  const handleChange = (e, key) => {
    const { value } = e.target;

    setItem({
      ...item,
      id,
      [key]: value,
    });
  };

  const handleSubmit = () => {
    onSubmit(item);
    setItem({ item: "", description: "" });
  };

  return headerSmall ? (
    <MyCard
      className={className}
      bordered={false}
      extra={
        useAction ? (
          version === 1 ? (
            <ActionButtons
              className="ml-[12px]"
              onCancel={onCancel}
              onSubmit={handleSubmit}
            />
          ) : (
            <LightActionButtons
              className="ml-[12px]"
              onCancel={onCancel}
              onSubmit={handleSubmit}
            />
          )
        ) : (
          <CardHeaderLink onClick={handleSubmit}>Done</CardHeaderLink>
        )
      }
      title={
        <Input
          value={item.title}
          onChange={(e) => handleChange(e, "title")}
          placeholder="Result name..."
        />
      }
      headStyle={{
        background: "#F5F5F5",
      }}
    >
      <TextArea
        autoSize={{ minRows: 6 }}
        value={item.description}
        onChange={(e) => handleChange(e, "description")}
        placeholder="Result description..."
      />
      {extraItems}
    </MyCard>
  ) : (
    <Card
      className={className}
      bordered={false}
      extra={
        useAction ? (
          version === 1 ? (
            <ActionButtons
              className="ml-[12px]"
              onCancel={onCancel}
              onSubmit={handleSubmit}
            />
          ) : (
            <LightActionButtons
              className="ml-[12px]"
              onCancel={onCancel}
              onSubmit={handleSubmit}
            />
          )
        ) : (
          <CardHeaderLink onClick={handleSubmit}>Done</CardHeaderLink>
        )
      }
      title={
        <Input
          value={item.title}
          onChange={(e) => handleChange(e, "title")}
          placeholder="Result name..."
        />
      }
      headStyle={{
        background: "#F5F5F5",
      }}
    >
      <TextArea
        autoSize={{ minRows: 6 }}
        value={item.description}
        onChange={(e) => handleChange(e, "description")}
        placeholder="Result description..."
      />
      {extraItems}
      <Button block className="bg-[#FF4D4F] text-white mt-2" onClick={onDelete}>
        Remove
      </Button>
    </Card>
  );
};
