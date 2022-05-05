import React, { useState, useEffect } from "react";
import { Card, Space, Button, Form, Input, Row, Col, Drawer, Radio, DatePicker, TimePicker, Switch } from "antd";
import {
  DeleteOutlined,
  HourglassOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const Team = () => {

  return (
    <div id="billings">
      <div className="mb-[42px]">
        <h3 className="font-semibold text-16 mb-3">Members</h3>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p>Theresa Webb</p>
              <p>twebb@example.com</p>
            </div>
            <Space>
              <DatePicker placeholder="Unlimited" />
              <Button className="flex items-center" icon={<DeleteOutlined />}>
                Remove
              </Button>
            </Space>
          </div>
        </Card>
        <Card className="mt-[9px]">
          <div className="flex items-center justify-between">
            <div>
              <p>Theresa Webb</p>
              <p>twebb@example.com</p>
            </div>
            <Space>
              <DatePicker placeholder="Unlimited" />
              <Button className="flex items-center" icon={<DeleteOutlined />}>
                Remove
              </Button>
            </Space>
          </div>
        </Card>
      </div>
      <div>
        <h3 className="font-semibold text-16 mb-3">Viewers</h3>
        <Card className="mb-[9px]">
          <div className="flex items-center justify-between">
            <div>
              <p>Theresa Webb</p>
              <p>twebb@example.com</p>
            </div>
            <Space>
              <DatePicker placeholder="Unlimited" />
              <Button className="flex items-center" icon={<DeleteOutlined />}>
                Remove
              </Button>
            </Space>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p>Theresa Webb</p>
              <p>twebb@example.com</p>
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
              <Button className="flex items-center" icon={<PoweroffOutlined />}>
                Reactivate
              </Button>
            </Space>
          </div>
        </Card>
      </div>

      {/*  */}
    </div>
  );
};

export default Team;
