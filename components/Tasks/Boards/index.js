import React from "react";
import styled from "styled-components";

import { Board as RBoard, useCard, useColumn } from "react-sdndk";

import { Card as Acard, Row, Col } from "antd";
import { CardTitle } from "../../Dashboard/CardTitle";

const Grid = styled.div`
  display: grid;
  gap: 16px;
`;

const StyledCol = styled(Acard)`
  min-height: 72vh;
  min-width: 245px;

  

  .ant-card-head {
    min-height: unset;
    border-bottom: 2px solid #d9d9d9;
  }

  .ant-card-body {
    max-height: 511px;
    overflow-y: auto;
  }

  .ant-card-extra {
    padding: 0;
  }
`;

const StyledCard = styled.div`
  width: 100%;
  /* border-bottom: 1px solid #d9d9d9; */
  background: #fff;
  /* display: grid;
  grid-template-columns: 40px 1fr; */
  padding: 16px;
  align-items: center;
  gap: 10px;
  opacity: ${(props) => (props.$isDraggging ? 0 : 1)};
`;

const Title = styled(CardTitle)`
  font-size: 16px;
  line-height: 24px;
`;

const Card = ({ children, id, colId, onCardDrop }) => {
  const [card, isDragging] = useCard({
    id,
    colId,
    onDrop: (idTarget) => {
      onCardDrop?.(idTarget, { id, colId });
    },
  });

  return <StyledCard ref={(node) => card(node)}>{children}</StyledCard>;
};

const Column = ({ children, columnId, columnName, header, onCardEntry }) => {
  const col = useColumn({
    columnId,
    onCardEntry: (card) => {
      onCardEntry?.(card, columnId);
    },
  });

  return (
    <StyledCol
      ref={col}
      extra={header}
      title={<Title>{columnName}</Title>}
      className="border-2 border-[#D9D9D9]"
      bodyStyle={{
        padding: "0",
      }}
      headStyle={{
        background: "#F5F5F5",
      }}
    >
      {children}
    </StyledCol>
  );
};

const Board = ({
  columns = [],
  onDrop,
  onSwap,
  columnHeaderRenders = [],
  maxWidthClass,
  children,
  renderColumn,
  colCount = 3,
}) => {
  const swapCard = (target, current) => {
    onSwap(target, current);
  };

  const entryCard = (card, targetColId) => {
    onDrop(card, targetColId);
  };

  return (
    <RBoard>
      <div className={maxWidthClass}>
        <Grid
          style={{
            gridTemplateColumns: `repeat(${colCount + 1},1fr)`,
          }}
        >
          {columns?.map((col, i) => (
            <div key={col.columnId}>
              <Column
                columnId={col.columnId}
                columnName={col.columnName}
                onCardEntry={entryCard}
                header={columnHeaderRenders[i]}
                key={col.columnId}
              >
                {col?.data?.map((card, i) => (
                  <Card
                    key={card.order}
                    id={card.order}
                    colId={col.columnId}
                    onCardDrop={swapCard}
                  >
                    {renderColumn(card, i)}
                  </Card>
                ))}
              </Column>
            </div>
          ))}

          <div
            style={{
              visibility: "hidden",
            }}
          >
            <Column />
          </div>
        </Grid>
      </div>
    </RBoard>
  );
};

export { Board };
