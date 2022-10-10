import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

import { Card, Button } from "antd";

const StyledCard = styled(Card)`
  box-shadow: ${(props) =>
    props.$active
      ? "0px 4px 4px rgba(0, 0, 0, 0.08), 1px -4px 4px rgba(0, 0, 0, 0.06)"
      : ""};
  border-radius: 2px;
  margin-bottom: 20px;

  .ant-card-head {
    min-height: unset;
  }

  .ant-card-head-title {
    padding: 0;
  }

  .ant-card-head-wrapper {
    margin: 20px 0;
  }
  .ant-card-extra {
    padding: 0;
  }
`;

import { CardTitle } from "../../Dashboard/CardTitle";
import { CardHeaderLink } from "../../Dashboard/CardHeaderButton";

const StatementCard = ({
  index,
  onEditClick,
  info,
  product,
  isActive,
  style,
  isDown,
}) => {
  const ref = useRef();
  const [trans, setTrans] = useState({});
  useEffect(() => {
    if (isDown && ref?.current) {
      setTrans({
        position: "relative",
        marginTop: "50px",
        transform: `translateY(00%)`,
      });
    }
  }, [isDown]);

  if (!info) {
    return <></>;
  }

  return (
    <div
      ref={ref}
      style={{
        ...style,
        ...trans,
      }}
      className="absolute top-0 left-0 right-0 max-w-full transition-transform"
    >
      <StyledCard
        $active={isActive}
        extra={
          <CardHeaderLink onClick={() => onEditClick(info)}>
            Edit
          </CardHeaderLink>
        }
        title={
          <CardTitle className="!text-[16px] !leading[24px]">
            Guiding Statement
          </CardTitle>
        }
      >
        <p className="text-[30px] leading-[38px]">
          {" "}
          {`For ${info.targetCustomer}, who ${info.need}, the ${product} is a [product category or description] that ${info.keyBenefits}.`}
        </p>

        <br />

        <p className="text-[30px] leading-[38px]">
          {`Unlike ${info.competitors}, our product ${info.differentiators}.`}
        </p>
      </StyledCard>
    </div>
  );
};

export default StatementCard;
