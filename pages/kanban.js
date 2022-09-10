/* eslint-disable react-hooks/rules-of-hooks */
import React, {useState, useEffect} from "react";
import { Tag, Row, Col } from "antd";
import { FileOutlined } from "@ant-design/icons";
import Kanban from "../ui/Kanban";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const data = [
  {
    id: "1",
    name: "System",
    order: 0,
    status: "identified",
  },
  {
    id: "2",
    name: "Billing",
    order: 1,
    status: "under review",
  },
  {
    id: "3",
    name: "Stats",
    order: 2,
    status: "identified",
  },
];

const columns = ["identified", "under review", "adjuticated"]

export default function kanban() {
  const [winReady, setwinReady] = useState(false);

  useEffect(() => {
    setwinReady(true);
  }, []);

  const onDragEnd = (result) => {
    console.log(result);
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    let order = source.index;
    data[order].status = destination.droppableId;
    console.log(data)




  };

  return (
    <div className="p-10">
      <h2 className="text-2xl mb-6">Kanban Board Design</h2>

      {winReady && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Row gutter={16}>
            {columns.map((column, i) => (
              <Droppable droppableId={column} key={i}>
                {(provided) => (
                  <Col
                    span={8}
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    <Kanban
                      boardTitle={column}
                      data={data.filter((item) => item.status === column)}
                    />
                    {provided.placeholder}
                  </Col>
                )}
              </Droppable>
            ))}
          </Row>
        </DragDropContext>
      )}
    </div>
  );
}


{/* <DragDropContext onDragEnd={onDragEnd}>
  <Droppable droppableId="droppable">
    {(provided) => (
      <Row {...provided.droppableProps} ref={provided.innerRef} gutter={16}>
        <Col span={8}>
          <Kanban
            boardTitle="identified"
            data={data.filter((item) => item.status === "identified")}
          />
        </Col>

        <Col span={8}>
          <Kanban
            boardTitle="Under Review"
            data={data.filter((item) => item.status === "under review")}
          />
        </Col>

        <Col span={8}>
          <Kanban
            boardTitle="adjuticated"
            data={data.filter((item) => item.status === "adjuticated")}
          />
        </Col>
        {provided.placeholder}
      </Row>
    )}
  </Droppable>
</DragDropContext>; */}