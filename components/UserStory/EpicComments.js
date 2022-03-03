import React from 'react';
import {Comment, Tooltip, List, Avatar, Form, Button, Input } from 'antd';
import { SendOutlined, FlagOutlined } from '@ant-design/icons';

const {TextArea} = Input

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
  },
  {
    actions: [<span key="comment-list-reply-to-0">Reply to</span>],
    author: "Kim James",
    avatar: "https://joeschmoe.io/api/v1/random",
    content: <p>Is this really want we think the story should be?</p>,
  },
];


const EpicComments = () => {
  return (
    <>
      <List
        className="comment-list"
        // header={`${data.length} replies`}
        itemLayout="horizontal"
        dataSource={data}
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
            // onChange={this.handleChange}
            // onSubmit={this.handleSubmit}
            // submitting={submitting}
            // value={value}
          />
        }
      />
    </>
  );
}

export default EpicComments;


const Editor = ({ onChange, onSubmit, submitting, value }) => (
  <>
    <Form.Item>
      <TextArea rows={3} onChange={onChange} value={value} />
    </Form.Item>
    <Form.Item>
      <div className="flex space-x-3">
        <Button
          className="text-blue-400 flex items-center"
          htmlType="submit"
          loading={submitting}
          onClick={onSubmit}
          icon={<SendOutlined />}
          type="primary"
          disabled
        >
          Post
        </Button>
        <Button
          className="flex items-center"
          danger
          htmlType="submit"
          loading={submitting}
          onClick={onSubmit}
          icon={<FlagOutlined />}
        >
          Flag
        </Button>
      </div>
    </Form.Item>
  </>
);