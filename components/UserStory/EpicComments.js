import React from "react";
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

const EpicComments = ({ type }) => {
  const [comments, setComments] = React.useState(data);
  const [comment, setComment] = React.useState("");

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
    <div className="h-full overflow-y-auto">
      <List
        className="comment-list"
        // header={`${data.length} replies`}
        itemLayout="horizontal"
        dataSource={comments.filter((item) => item.type === type)}
        renderItem={(item) => (
          <li>
            <Comment
              actions={item.actions}
              author={item.author}
              avatar={item.avatar}
              content={item.content}
              // datetime={item.datetime}
            />
          </li>
        )}
      />
      <Comment
        avatar={
          <Avatar src="https://joeschmoe.io/api/v1/random" alt="Han Solo" />
        }
        content={
          <Editor
          onChange={(e) => setComment(e.target.value)}
          onSubmit={addComment}
          // submitting={submitting}
          value={comment}
          />
        }
      />
    </div>
  );
};

export default EpicComments;

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
