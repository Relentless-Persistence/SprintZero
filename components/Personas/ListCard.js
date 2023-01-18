import React, { useState, useEffect } from "react";
import styled from "styled-components";

import { Card, Input, Form, Button } from "antd";

import { PlusCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";

import { OL } from "./NumberList";

import { CardHeaderLink } from "../Dashboard/CardHeaderButton";
import ActionButtons from "./ActionButtons";
import { useAuth } from "../../contexts/AuthContext";

const MyInput = styled(Input)`
  .ant-input-group-wrapper {
    position: relative;
  }

  .ant-input-group-addon {
    background: transparent;
  }

  .ant-input {
    border-left: none;
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

const MyCard = styled(Card)`
  .ant-card-head {
    min-height: unset;
    border-bottom: 2px solid #d9d9d9;
  }
`;

const ListCard = ({ handleEdit, title = "Goals", cardData = [], id }) => {
  const userRole = "member";
  const [list, setList] = useState(cardData);

  const [isEdit, setIsEdit] = useState(false);

  const toggleEdit = () => setIsEdit(true);

  const onFinish = () => {
    const values = list.filter((it) => it.trim().length > 0);
    handleEdit(values);
    setIsEdit(false);
  };

  const onCancel = () => {
    setIsEdit(false);
    setList(null);
  };

  const onEdit = () => {
    if(list[0] === "" || list.length < 1) {
      const newList = [...list, ""];
      setList(newList);
      setIsEdit(true)
    } else {
      setIsEdit(true)
    }
  }

  const add = () => {
    const newList = [...list, ""];
    setList(newList);
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

  return isEdit ? (
    <MyCard
      className="border-2 border-[#D9D9D9]"
      extra={<ActionButtons onCancel={onCancel} onSubmit={onFinish} />}
      title={<strong>{title}</strong>}
      headStyle={{
        background: "#F5F5F5",
      }}
    >
      {cardData &&
        list.map((it, i) => (
          <MyInput
            key={i}
            value={it}
            className="mb-[12px] outline-none hover:outline-none"
            onChange={(e) => onChange(e, i)}
            addonBefore={
              <div className="flex items-center justify-between">
                <button
                  onClick={() => remove(i)}
                  className="flex items-center mr-[5px]"
                >
                  <MinusCircleOutlined
                    style={{
                      color: "#C82D73",
                    }}
                  />
                </button>
                {`${i + 1}.`}
              </div>
            }
            autoFocus
            $removeRightBorder={i === list.length - 1}
            addonAfter={
              i === list.length - 1 ? (
                <Add onClick={add}>
                  <PlusCircleOutlined
                    style={{
                      color: "#009C7E",
                    }}
                  />
                </Add>
              ) : null
            }
          />
        ))}
    </MyCard>
  ) : (
    <>
      {userRole && (
        <MyCard
          className="border-2 border-[#D9D9D9]"
          extra={
            userRole !== "viewer" ? (
              <CardHeaderLink size="small" onClick={toggleEdit}>
                Edit
              </CardHeaderLink>
            ) : null
          }
          title={<strong>{title}</strong>}
          headStyle={{
            background: "#F5F5F5",
          }}
        >
          {cardData[0] === "" ? (
            <p>
              No{" "}
              <span
                className="cursor-pointer font-semibold"
                onClick={() => onEdit()}
              >
                {title}
              </span>{" "}
              Added Yet
            </p>
          ) : (
            <OL>
              {cardData.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </OL>
          )}
        </MyCard>
      )}
    </>
  );
};

export { ListCard };
