import React, { useState } from "react";
import styled from "styled-components";

import { Card, Input, Button, Timeline } from "antd";

import { PlusCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";

import { CardHeaderLink } from "../Dashboard/CardHeaderButton";
import ActionButtons from "./ActionButtons";

const MyCard = styled(Card)`
  .ant-card-head {
    min-height: unset;
    border-bottom: 2px solid #d9d9d9;
  }
`;

const MyInput = styled(Input)`
  .ant-input-group-wrapper {
    position: relative;
  }

  .ant-input-group-addon {
    background: transparent;
  }

  .ant-input {
    border-left: ${(props) => (props.$hasLeftBorder ? "" : "none")};
    border-right: ${(props) => (props.$removeRightBorder ? "none" : "")};
    padding: 5px 11px;
  }
`;

const Add = styled(Button)`
  background: transparent !important;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
`;

const Remove = styled(Button)`
  background: transparent !important;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
`;

const TimeLineCard = ({ handleEdit, title = "Goals", cardData = [] }) => {
  const [list, setList] = useState([...cardData]);

  const [isEdit, setIsEdit] = useState(false);

  const toggleEdit = () => setIsEdit((s) => !s);

  const onFinish = () => {
    const values = list.filter((it) => it.trim().length > 0);
    handleEdit(values);
    setIsEdit(false);
  };

  const onCancel = () => {
    setIsEdit(false);
  };

  const add2 = () => {
    const newList = [...list, "", ""];
    setList(newList);
  };

  const add = (index) => {
    if (index) {
      const beforeIndex = [...list].slice(0, index);
      const after = [...list].slice(index);
      setList([...beforeIndex, "", ...after]);
    } else {
      const newList = [...list, ""];
      setList(newList);
    }
  };

  const remove = (index) => {
    const newList = list.filter((_, i) => i !== index);
    setList(newList);
  };

  const onChange = (e, i) => {
    const newList = [...list];
    newList[i] = e.target.value;

    setList(newList);
  };

  if (isEdit) {
    const first = list[0];
    const last = list[list.length - 1];
    const beforeLast = list[list.length - 2];

    const rest = list.slice(1, -2);

    return (
      <MyCard
        className="border-2 border-[#D9D9D9]"
        extra={<ActionButtons onCancel={onCancel} onSubmit={onFinish} />}
        title={<strong>{title}</strong>}
        headStyle={{
          background: "#F5F5F5",
        }}
      >
        <MyInput
          placeholder={"Start | 6 am"}
          value={first}
          $hasLeftBorder={true}
          $removeRightBorder={list.length === 1}
          className="mb-[12px]"
          onChange={(e) => onChange(e, 0)}
          addonAfter={
            list.length < 2 ? (
              <Add onClick={add2}>
                <PlusCircleOutlined
                  style={{
                    color: "#009C7E",
                  }}
                />
              </Add>
            ) : null
          }
        />

        {list.length >= 3 ? (
          <>
            {rest.map((field, index) => (
              <MyInput
                className="mb-[12px]"
                onChange={(e) => onChange(e, index + 1)}
                key={index + 1}
                addonAfter={
                  <Add onClick={() => add(index + 2)}>
                    <PlusCircleOutlined
                      style={{
                        color: "#009C7E",
                      }}
                    />
                  </Add>
                }
                addonBefore={
                  <Remove onClick={() => remove(index + 1)}>
                    <MinusCircleOutlined
                      style={{
                        color: "#C82D73",
                      }}
                    />
                  </Remove>
                }
                placeholder={"Next Step"}
                value={field}
              />
            ))}

            <MyInput
              key={list.length - 2}
              onChange={(e) => onChange(e, list.length - 2)}
              placeholder={"Next step"}
              value={beforeLast}
              $removeRightBorder={true}
              className="mb-[12px]"
              addonBefore={
                <Remove onClick={remove}>
                  <MinusCircleOutlined
                    style={{
                      color: "#C82D73",
                    }}
                  />
                </Remove>
              }
              addonAfter={
                <Add onClick={() => add(list.length - 1)}>
                  <PlusCircleOutlined
                    style={{
                      color: "#009C7E",
                    }}
                  />
                </Add>
              }
            />
          </>
        ) : null}

        {list.length > 2 ? (
          <Input
            onChange={(e) => onChange(e, list.length - 1)}
            className="mb-[12px]"
            key={list.length - 1}
            placeholder={"End | 10 am"}
            value={last}
          />
        ) : null}
      </MyCard>
    );
  }

  return (
    <MyCard
      className="border-2 border-[#D9D9D9]"
      extra={<CardHeaderLink onClick={toggleEdit}>Edit</CardHeaderLink>}
      title={<strong>{title}</strong>}
      headStyle={{
        background: "#F5F5F5",
      }}
    >
      <Timeline>
        {cardData[0] === "" ? (
          <p>
            No{" "}
            <span
              className="cursor-pointer font-semibold"
              onClick={() => setIsEdit(true)}
            >
              {title}
            </span>{" "}
            Added Yet
          </p>
        ) : (
          cardData.map((item, i) => (
            <Timeline.Item
              key={i}
              color={
                i === 0 ? "green" : i === cardData.length - 1 ? "black" : "blue"
              }
            >
              <p>{item}</p>
            </Timeline.Item>
          ))
        )}
      </Timeline>
    </MyCard>
  );
};

export { TimeLineCard };
