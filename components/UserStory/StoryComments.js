import React, {useState} from "react";
import { Comment, Tooltip, List, Avatar, Form, Button, Input } from "antd";
import { SendOutlined, FlagOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const data = [
  {
    actions: [<span key="comment-list-reply-to-0">Reply to</span>],
    author: "Han Solo",
    avatar: "https://joeschmoe.io/api/v1/random",
    content: (
      <p>
        Authoritatively disseminate prospective leadership via opportunities
        economically sound.
      </p>
    ),
    type: "design",
  },
  {
    actions: [<span key="comment-list-reply-to-0">Reply to</span>],
    author: "Kim James",
    avatar: "https://joeschmoe.io/api/v1/random",
    content: <p>Is this really want we think the story should be?</p>,
    type: "code",
  },
];

 

const StoryComments = ({ comments }) => {

  const addComment = () => {
    setComments([...comments,
      {
        actions: [<span key="comment-list-reply-to-0">Reply to</span>],
        author: "James Bond",
        avatar: "https://joeschmoe.io/api/v1/random",
        content: <p>{comment}</p>,
        type: type,
      },
    ]);
    setComment("");
  };

  return (
    <div className="overflow-y-auto">
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
