import React, { useState } from "react";
import styled from "styled-components";
import { Card } from "antd";

import CardHeaderButton, { CardHeaderLink } from "./CardHeaderButton";
import FormCard, { ActionFormCard } from "./FormCard";
import { CardTitle as Title } from "./CardTitle";

const MyCard = styled(Card)`
  .ant-card-head {
    min-height: unset;
    border-bottom: 2px solid #d9d9d9;
    padding: ${(props) => (props.$headerSmall ? "0 12px" : "0 24px")};
  }

  .ant-card-head-title {
    padding: 0;
  }

  .ant-card-head-wrapper {
    margin: 16px 0;
  }
  .ant-card-extra {
    padding: 0;
  }

  .ant-card-body {
    padding: ${(props) => (props.$headerSmall ? "12px" : "24px")};
  }
`;

const ItemCard = ({
  onEdit,
  useBtn,
  item,
  itemBtnText = "Edit",
  version = 2,
  headerSmall = false,
  extraItems,
}) => {
  const [isEdit, setIsEdit] = useState(false);

  const toggleEdit = () => setIsEdit((s) => !s);

  const handleEdit = (item) => {
    onEdit(item);
    toggleEdit();
  };

  if (isEdit) {
    return (
      <ActionFormCard
        headerSmall={headerSmall}
        extraItems={extraItems}
        id={item?.id}
        title={item.name}
        description={item.description}
        useAction={true}
        version={version}
        onSubmit={handleEdit}
        onCancel={toggleEdit}
        className="mb-[16px] border-2 border-[#D9D9D9]"
      />
    );
  }

  return (
    <MyCard
      $headerSmall={headerSmall}
      className="mb-[16px] border-2 border-[#D9D9D9]"
      extra={
        useBtn ? (
          <CardHeaderButton size="small" onClick={toggleEdit}>
            {itemBtnText}
          </CardHeaderButton>
        ) : (
          <CardHeaderLink size="small" onClick={toggleEdit}>
            Edit
          </CardHeaderLink>
        )
      }
      title={<Title>{item.name}</Title>}
      headStyle={{
        background: "#F5F5F5",
      }}
    >
      <p>{item.description}</p>
    </MyCard>
  );
};

export default ItemCard;
