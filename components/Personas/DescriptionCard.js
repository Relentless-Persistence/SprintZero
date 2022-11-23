import React, { useState } from "react";
import styled from "styled-components";

import { Card, Input, Form, Button } from "antd";

import { CardHeaderLink } from "../Dashboard/CardHeaderButton";
import ActionButtons from "./ActionButtons";
import { useAuth } from "../../contexts/AuthContext";

const { TextArea } = Input;

const MyCard = styled(Card)`
  .ant-card-head {
    min-height: unset;
    border-bottom: 2px solid #d9d9d9;
  }
`;

const DescriptionCard = ({
  handleEdit,
  title = "Goals",
  name = "",
  cardData = [],
}) => {
  const { userRole } = useAuth();
  const [isEdit, setIsEdit] = useState(false);
  const [state, setState] = useState(cardData);

  const toggleEdit = () => setIsEdit((s) => !s);

  const handleChange = (e) => {
    const { value } = e.target;
    setState(value);
  };

  const onFinish = () => {
    handleEdit(state);
    toggleEdit();
  };

  const onCancel = () => {
    toggleEdit();
    setState(cardData);
  };

  if (isEdit) {
    return (
      <MyCard
        className="border-2 border-[#D9D9D9]"
        extra={<ActionButtons onCancel={onCancel} onSubmit={onFinish} />}
        title={<strong>{title}</strong>}
        headStyle={{
          background: "#F5F5F5",
        }}
      >
        <Form name={`${name}${title}fields`}>
          <TextArea
            autoSize={{ minRows: 6 }}
            value={state}
            onChange={handleChange}
            placeholder="Description..."
          />
        </Form>
      </MyCard>
    );
  }

  return (
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
          {cardData === "" ? (
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
            <p>{cardData}</p>
          )}
        </MyCard>
      )}
    </>
  );
};

export { DescriptionCard };
