import React from "react";

import { Card, Tag } from "antd5";
import styled from "styled-components";

import { CardHeaderLink } from "../CardHeaderButton";
import { getTimeAgo } from "../../../utils";

const MyCard = styled(Card)`
  .ant-card-head {
    min-height: unset;
    padding: 0 16px;
  }

  .ant-card-body {
    padding: 12px 16px;
  }

  .ant-card-head-title {
    padding: 0;
  }

  .ant-card-head-wrapper {
    margin: 7px 0;
  }
  .ant-card-extra {
    padding: 0;
  }
`;

const DialogueCard = ({ dialogue, setItem, openDrawer }) => {

  const handleOpen = () => {
    openDrawer(true);
    setItem(dialogue);
  };
  
  return (
    <MyCard
      className="border-2 border-[#D9D9D9]"
      title={dialogue.name}
      extra={<CardHeaderLink onClick={handleOpen}>View</CardHeaderLink>}
      headStyle={{
        background: "#F5F5F5",
      }}
    >
      <p>Last Updated {getTimeAgo(new Date(dialogue.updatedAt), true)}</p>

      <br />

      <Tag color="default">{dialogue.post}</Tag>
    </MyCard>
  );
};

export { DialogueCard };
