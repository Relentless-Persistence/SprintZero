import React, {useState} from "react";
import { Comment, Tooltip, List, Avatar, Form, Button, Input } from "antd";
import { SendOutlined, FlagOutlined } from "@ant-design/icons";

const { TextArea } = Input;

 

const StoryComments = ({ comments }) => {

  return (
    <div className="h-[120px] overflow-y-auto">
      {comments && (
        <List
          className="comment-list"
          // header={`${data.length} replies`}
          itemLayout="horizontal"
          dataSource={comments}
          renderItem={(item) => (
            <li>
              <Comment
                // actions={actions}
                author={item.author.name}
                avatar={item.author.avatar}
                content={item.comment}
                // datetime={item.datetime}
              />
            </li>
          )}
        />
      )}
    </div>
  );
};

export default StoryComments;

const Editor = ({ onChange, onSubmit, value }) => (
  <>
    <Form.Item>
      <TextArea rows={3} onChange={onChange} value={value} />
    </Form.Item>
    <Form.Item>
      <div className="flex space-x-3">
        <Button
          className="text-blue-400 flex items-center"
          // htmlType="submit"
          // loading={submitting}
          onClick={() => onSubmit()}
          icon={<SendOutlined />}
          type="primary"
          disabled={!value}
        >
          Post
        </Button>
        <Button
          className="flex items-center"
          danger
          htmlType="submit"
          // onClick={onSubmit}
          icon={<FlagOutlined />}
        >
          Flag
        </Button>
      </div>
    </Form.Item>
  </>
);
