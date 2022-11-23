import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";

import { Card, Input, Form, Button } from "antd";

import { PlusCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";

import { OL } from "./NumberList";

import { CardHeaderLink } from "../Dashboard/CardHeaderButton";
import ActionButtons from "./ActionButtons";
import { db } from "../../config/firebase-config";
import { capitalize, debounce } from "lodash";
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

const PersonasListCard = ({
  handleEdit,
  title,
  cardData = [],
  id,
  product
}) => {
  const { userRole } = useAuth();
  const [isEdit, setIsEdit] = useState(false);

  const toggleEdit = () => setIsEdit((s) => !s);

  const onFinish = () => {
    // const values = list.filter((it) => it.trim().length > 0);
    // handleEdit(values);
    setIsEdit(false);
  };

  const onCancel = () => {
    setIsEdit(false);
  };

  const add = () => {
    // const newList = [...list, ""];
    // setList(newList);
    db.collection("Personas").add({
      role: "",
      product_id: product.id,
      goals: [""],
      interactions: [""],
      dailyLife: [""],
      tasks: [""],
      responsibilities: [""],
      priorities: [""],
      frustrations: [""],
      changes: [""],
      description: "",
    });
  };

  const remove = (id) => {
    // const newList = list.filter((_, i) => i !== index);
    // setList(newList);
    db.collection("Personas").doc(id).delete();
  };

  const updatePersona = (value, id) => {
    db.collection("Personas").doc(id).update({ role: value })
  }

  // This function is expensive but debounce doesn't work
  const onChange = (value, id) => {
    // const newList = [...list];
    // newList[i] = e.target.value;

    // setList(newList);
    // console.log(e.target.value, id)
    
    // debounce(() => updatePersona(e.target.value, id),
    //   2000
    // );
    db.collection("Personas").doc(id).update({ role: value });
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
      {cardData.map((it, i) => (
        <MyInput
          key={it.id}
          value={it.role}
          className="mb-[12px]"
          onChange={(e) => onChange(e.target.value, it.id)}
          addonBefore={
            <div className="flex items-center justify-between">
              <button
                onClick={() => remove(it.id)}
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
          $removeRightBorder={i === cardData.length - 1}
          addonAfter={
            i === cardData.length - 1 ? (
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
          <OL>
            {cardData.length < 1 ? (
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
              cardData.map((item, i) => <li key={i}>{item.role}</li>)
            )}
          </OL>
        </MyCard>
      )}
    </>
  );
};

export { PersonasListCard };
