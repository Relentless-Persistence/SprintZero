import React from 'react'
import { FileOutlined } from "@ant-design/icons";
import { Draggable } from 'react-beautiful-dnd';

const Kanban = ({
  boardTitle,
  data
}) => {
  return (
    <div className="bg-white w-full h-[595px] border border-[#D9D9D9] rounded-[2px]">
      <div className="h-14 py-4 px-6 bg-[#f5f5f5] border-b border-[#D9D9D9]">
        <h3 className="text-[16px] font-semibold capitalize">{boardTitle}</h3>
      </div>

      {data.map((item, i) => (
        <Draggable key={item.order} draggableId={item.id} index={item.order}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className="flex space-x-[18px] h-[60px] p-4 border-b border-[#D9D9D9]"
            >
              <p className="h-8 w-8 flex items-center justify-center border border-[#101D06] text-[#101D06] rounded-full">
                {i + 1}
              </p>

              <div className="flex items-center border-2 border-[#0073B3] rounded py-[13px]">
                <div className="bg-[#0073B3] text-white py-[7px] px-[2px] -ml-[1px] rounded-l">
                  <p className="-rotate-90 text-xs">1.0</p>
                </div>

                <div className="flex items-center justify-center text-[#0073B3] text-[14px] px-[8px] capitalize">
                  <FileOutlined className="mr-1" />
                  {item.name}
                </div>
              </div>
            </div>
          )}
        </Draggable>
      ))}
    </div>
  );
}

export default Kanban