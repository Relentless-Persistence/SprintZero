/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  Card,
  Space,
  Button,
  Form,
  Input,
  Row,
  Col,
  Drawer,
  Radio,
  DatePicker,
  TimePicker,
  Switch,
  Tabs,
} from "antd";
import {
  DeleteOutlined,
  HourglassOutlined,
  PoweroffOutlined,
  KeyOutlined
} from "@ant-design/icons";
import { db } from "../../config/firebase-config";
import { activeProductState } from "../../atoms/productAtom";
import { useRecoilValue, useRecoilState } from "recoil";

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const Team = ({ teams }) => {
  const activeProduct = useRecoilValue(activeProductState);
  const [expiry, setExpiry] = useState("");
  const [id, setId] = useState(null);

  const handleDateChange = (date, dateString) => {

    db.collection("teams")
      .doc(id)
      .update({
        expiry: dateString
      })
  };

  const removeTeam = (id) => {
    db.collection("teams").doc(id).delete();
  }

  const activateTeam = (id) => {
    db.collection("teams").doc(id).update({
      expiry: "unlimited",
    });
  }

  return (
    <div id="billings">
      <div className="mb-[42px]">
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane
            tab={<div className="font-semibold text-[16px]">Members</div>}
            key="1"
          >
            <>
              {teams
                .filter((item) => item.type === "member")
                .filter(
                  (item) =>
                    item.expiry === "unlimited" ||
                    new Date(item.expiry) < new Date()
                )
                .map((team, i) => (
                  <Card key={i}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{team.user.name}</p>
                        <p>{team.user.email}</p>
                      </div>
                      <Space>
                        <DatePicker
                          placeholder={team.expiry}
                          onChange={handleDateChange}
                          onClick={() => setId(team.id)}
                        />
                        <Button
                          className="flex items-center"
                          icon={<DeleteOutlined />}
                          onClick={() => removeTeam(team.id)}
                        >
                          Remove
                        </Button>
                      </Space>
                    </div>
                  </Card>
                ))}
              <div className="font-semibold text-[16px] mt-4 mb-4">Archive</div>
              {teams
                .filter((item) => item.type === "member")
                .filter((item) => new Date(item.expiry) > new Date())
                .map((team, i) => (
                  <Card key={i}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{team.user.name}</p>
                        <p>{team.user.email}</p>
                      </div>
                      <Space>
                        <Button
                          className="flex items-center"
                          icon={<HourglassOutlined />}
                          danger
                          ghost
                        >
                          Expired
                        </Button>
                        <Button
                          className="flex items-center"
                          icon={<KeyOutlined />}
                          onClick={() => activateTeam(team.id)}
                        >
                          Activate
                        </Button>
                      </Space>
                    </div>
                  </Card>
                ))}
            </>
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={<h3 className="font-semibold text-[16px]">Viewers</h3>}
            key="2"
          >
            <>
              {teams
                .filter((item) => item.type === "viewer")
                .filter(
                  (item) =>
                    item.expiry === "unlimited" ||
                    new Date(item.expiry) < new Date()
                )
                .map((team, i) => (
                  <Card key={i} className="mb-[9px]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{team.user.name}</p>
                        <p>{team.user.email}</p>
                      </div>
                      <Space>
                        <DatePicker
                          placeholder={team.expiry}
                          onChange={handleDateChange}
                          onClick={() => setId(team.id)}
                        />
                        <Button
                          className="flex items-center"
                          icon={<DeleteOutlined />}
                          onClick={() => removeTeam(team.id)}
                        >
                          Remove
                        </Button>
                      </Space>
                    </div>
                  </Card>
                ))}
              <div className="font-semibold text-[16px] mt-4 mb-4">Archive</div>
              {teams
                .filter((item) => item.type === "viewer")
                .filter((item) => new Date(item.expiry) > new Date())
                .map((team, i) => (
                  <Card key={i}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{team.user.name}</p>
                        <p>{team.user.email}</p>
                      </div>
                      <Space>
                        <Button
                          className="flex items-center"
                          icon={<HourglassOutlined />}
                          danger
                          ghost
                        >
                          Expired
                        </Button>
                        <Button
                          className="flex items-center"
                          icon={<KeyOutlined />}
                          onClick={() => activateTeam(team.id)}
                        >
                          Activate
                        </Button>
                      </Space>
                    </div>
                  </Card>
                ))}
            </>
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default Team;
