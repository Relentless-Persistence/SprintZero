import React, { useState } from "react";
import styled from "styled-components";
import { Button, Card } from "antd5";

import CardHeaderButton, { CardHeaderLink } from "./CardHeaderButton";
import FormCard, { ActionFormCard, ObjectiveActionFormCard, LearningsActionFormCard } from "./FormCard";
import { CardTitle as Title } from "./CardTitle";
import { useAuth } from "../../contexts/AuthContext"

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
  index,
  onDelete
}) => {
  const userRole = "member"
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
        onDelete={onDelete}
      />
    );
  }

  return (
    <>
      {userRole && (
        <Card
          // $headerSmall={headerSmall}
          className="mb-[16px] border border-[#D9D9D9]"
          type="inner"
          extra={
            userRole !== "viewer" ? (
              useBtn ? (
                <CardHeaderButton size="small" onClick={toggleEdit}>
                  {itemBtnText}
                </CardHeaderButton>
              ) : (
                <CardHeaderLink size="small" onClick={toggleEdit}>
                  Edit
                </CardHeaderLink>
              )
            ) : null
          }
          title={<Title>{item.name || `Result #${index}`}</Title>}
          headStyle={{
            background: "#F5F5F5",
          }}
        >
          <p>{item.description}</p>
        </Card>
      )}
    </>
  );
};

export const ObjectiveItemCard = ({
  onEdit,
  useBtn,
  item,
  itemBtnText = "Edit",
  version = 2,
  headerSmall = false,
  extraItems,
  index,
  onDelete,
}) => {
  const userRole = "member";
  const [isEdit, setIsEdit] = useState(false);

  const toggleEdit = () => setIsEdit((s) => !s);

  const handleEdit = (item) => {
    onEdit(item);
    toggleEdit();
  };

  if (isEdit) {
    return (
      <ObjectiveActionFormCard
        headerSmall={headerSmall}
        extraItems={extraItems}
        id={item?.id}
        name={item.name}
        description={item.description}
        useAction={true}
        version={version}
        onSubmit={handleEdit}
        onCancel={toggleEdit}
        className="mb-[16px] border-2 border-[#D9D9D9]"
        onDelete={onDelete}
      />
    );
  }

  return (
    <>
      {userRole && (
        <Card
          // $headerSmall={headerSmall}
          className="mb-[16px] border border-[#D9D9D9]"
          type="inner"
          extra={
            userRole !== "viewer" ? (
              useBtn ? (
                <CardHeaderButton size="small" onClick={toggleEdit}>
                  {itemBtnText}
                </CardHeaderButton>
              ) : (
                <CardHeaderLink size="small" onClick={toggleEdit}>
                  Edit
                </CardHeaderLink>
              )
            ) : null
          }
          title={<Title>{item.name || `Result #${index}`}</Title>}
          headStyle={{
            background: "#F5F5F5",
          }}
        >
          <p>{item.description}</p>
        </Card>
      )}
    </>
  );
};

export const LearningsItemCard = ({
	onEdit,
	useBtn,
	item,
	itemBtnText = "Edit",
	version = 2,
	headerSmall = false,
	extraItems,
	index,
	onDelete,
}) => {
	const userRole = "member"
	const [isEdit, setIsEdit] = useState(false)

	const toggleEdit = () => setIsEdit((s) => !s)

	const handleEdit = (item) => {
		onEdit(item)
		toggleEdit()
	}

	if (isEdit) {
		return (
			<LearningsActionFormCard
				headerSmall={headerSmall}
				extraItems={extraItems}
				id={item?.id}
				title={item.name}
				description={item.description}
        artifact={item.artifact}
				useAction={true}
				version={version}
				onSubmit={handleEdit}
				onCancel={toggleEdit}
				className="mb-[16px] border-2 border-[#D9D9D9]"
				onDelete={onDelete}
			/>
		)
	}

	return (
		<>
			{userRole && (
				<Card
					// $headerSmall={headerSmall}
					className="mb-[16px] border border-[#D9D9D9]"
					type="inner"
					extra={
						userRole !== "viewer" ? (
							useBtn ? (
								<CardHeaderButton size="small" onClick={toggleEdit}>
									{itemBtnText}
								</CardHeaderButton>
							) : (
								<CardHeaderLink size="small" onClick={toggleEdit}>
									Edit
								</CardHeaderLink>
							)
						) : null
					}
					title={<Title>{item.name || `Result #${index}`}</Title>}
					headStyle={{
						background: "#F5F5F5",
					}}
				>
					<p>{item.description}</p>

					<div className="mt-4 flex items-center justify-end">
						<a href={item.artifact} target="_blank">
							<Button className="mt-2 rounded-[2px] border-[#FF4D4F] text-[#FF4D4F]">View Artifact</Button>
						</a>
					</div>
				</Card>
			)}
		</>
	)
}

export default ItemCard;
