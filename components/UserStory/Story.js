import React from 'react';
import {FileOutlined} from '@ant-design/icons';
import {Input} from 'antd';

const Story = ({story, storyIndex, featureIndex, i, handleChangeStory}) => {
  return (
    <div
      key={i}
      className={`flex items-center border-2 border-[#0073B3] ${
        !story.name ? "border-dashed" : ""
      } rounded mb-[10px]`}
    >
      <div className="bg-[#0073B3] text-white py-[7px] px-[2px] -ml-[1px]">
        <p className="-rotate-90 text-xs">1.0</p>
      </div>

      <div className="flex items-center justify-center text-[#0073B3] text-[14px] px-[8px]">
        <FileOutlined className="mr-1" />
        <Input
          placeholder="New User Story"
          type="text"
          maxLength="16"
          className="max-w-[70px] focus:outline-none outline-none placeholder:text-[#4F2DC8] bg-transparent border-none"
          value={story.name}
          onChange={(e) =>
            handleChangeStory(i, featureIndex, storyIndex, e.target.value)
          }
        />
      </div>
    </div>
  );
}

export default Story;
