import React from "react";
import Head from "next/head";
import { functions } from "../config/firebase-config";
import { Button, notification, Divider, Space } from "antd";
import Kanban from "../ui/Kanban";

const test = () => {
  const addMessage = functions.httpsCallable("addMessage");
  const testFunction = async () => {
    await addMessage({ text: "test" })
    .then(res => {
      console.log(res);
    })
  }

  const openNotification = () => {
    notification.info({
      description:
        "This is the content of the notification. This is the content of the notification. This is the content of the notification.",
      placement: "bottomRight",
    });
  };

  return (
    <div>
      <Head>
        <title>Test | Sprint Zero</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Button
        onClick={() => openNotification("bottomRight")}
      >
        add new member
      </Button>
      <button
        onClick={testFunction}
        className="border border-blue-400 text-blue-400"
      >
        Click me!
      </button>

      <Kanban />
    </div>
  );
};

export default test;
