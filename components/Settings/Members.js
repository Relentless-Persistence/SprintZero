import React from 'react';
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
} from "antd";
import {
  DeleteOutlined,
  HourglassOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";

const Members = () => {
  return (
    <div id="billings">
      <div className="mb-[42px]">
        <h3 className="font-semibold text-[16px] mb-3">Active</h3>
        <Card className="mb-[9px]">
          <div className="flex items-center justify-between">
            <div>
              <p>Theresa Webb</p>
            </div>
            <Space>
              <Button
                className="flex items-center"
                icon={<HourglassOutlined />}
              >
                Unlimited
              </Button>
              <Button className="flex items-center" icon={<PoweroffOutlined />}>
                Deactivate
              </Button>
            </Space>
          </div>
        </Card>
        <Card className="mb-[9px]">
          <div className="flex items-center justify-between">
            <div>
              <p>Slot 2</p>
            </div>
            <Space>
              <Button className="flex items-center" disabled>
                AD4-4F6
              </Button>
              <Button className="flex items-center" icon={<PoweroffOutlined />}>
                Deactivate
              </Button>
            </Space>
          </div>
        </Card>
        <Card className="mb-[9px]">
          <div className="flex items-center justify-between">
            <div>
              <p>Slot 3</p>
            </div>
            <Space>
              <Button className="flex items-center" disabled>
                F89-FG5
              </Button>
              <Button className="flex items-center" icon={<PoweroffOutlined />}>
                Deactivate
              </Button>
            </Space>
          </div>
        </Card>
        <Card className="opacity-40">
          <div className="flex items-center justify-between">
            <div>
              <p>$3.99</p>
            </div>
            <Space>
              <Button className="flex items-center" disabled>
                NY5-89G
              </Button>
              <Button className="flex items-center" icon={<PoweroffOutlined />}>
                Deactivate
              </Button>
            </Space>
          </div>
        </Card>
      </div>
      <div>
        <h3 className="font-semibold text-[16px] mb-3">Inactive</h3>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p>Theresa Webb</p>
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
    </div>
  );
}

export default Members;
