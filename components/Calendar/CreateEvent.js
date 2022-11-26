import React, { useState } from "react";
import {
  Form,
  Row,
  Col,
  Input,
  DatePicker,
  TimePicker,
  Select,
  Radio,
  Checkbox
} from "antd";

const { TextArea } = Input;
const { Option } = Select;

const CreateEvent = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [frequency, setFrequency] = useState("once");
  const [days, setDays] = useState("");
  const [attendees, setAttendees] = useState("");

  const options = [
    { label: "Sun", value: "Sunday", disabled: frequency === "once" },
    { label: "Mon", value: "Monday", disabled: frequency === "once" },
    { label: "Tue", value: "Tuesday", disabled: frequency === "once" },
    { label: "Wed", value: "Wednesday", disabled: frequency === "once" },
    { label: "Thu", value: "Thursday", disabled: frequency === "once" },
    { label: "Fri", value: "Friday", disabled: frequency === "once" },
    { label: "Sat", value: "Saturday", disabled: frequency === "once" },
  ];

  return (
    <div>
      <Form>
        <Row gutter={24}>
          <Col span={8}>
            <div className="mb-4">
              <p className="font-semibold text-[20px] mb-2">Subject</p>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
              />
            </div>
            <div className="mb-4">
              <p className="font-semibold text-[20px] mb-2">Description</p>
              <TextArea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details"
              />
            </div>
          </Col>

          <Col span={8}>
            <Row>
              <Col span={12}>
                <p className="font-semibold text-[20px] mb-2">Date</p>
                <DatePicker
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Col>
              <Col span={12}>
                <p className="font-semibold text-[20px] mb-2">Time</p>
                <TimePicker
                  value={time}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Col>
            </Row>
            <div className="mt-4 mb-4">
              <p className="font-semibold text-[20px] mb-2">Frequency</p>
              <Select
                style={{ width: 120 }}
                value={frequency}
                onChange={(e) => setFrequency(e)}
              >
                <Option value="once">Once</Option>
                <Option value="repeat">Repeat</Option>
              </Select>
            </div>
            <div className="mt-4 mb-4">
              <p className="font-semibold text-[20px] mb-2">Day</p>
              <Radio.Group
                options={options}
                // onChange={this.onChange3}
                // value={value3}
                optionType="button"
              />
            </div>
          </Col>

          <Col span={8}>
            <div className="mt-4 mb-4">
              <p className="font-semibold text-[20px] mb-2">Attendees</p>
              <div className="flex flex-col items-start justify-start">
                <Checkbox>Kathryn</Checkbox>
                <Checkbox>
                  Jenny Wilson
                </Checkbox>
                <Checkbox>Ralph Edwards</Checkbox>
                <Checkbox>Jerome Bell</Checkbox>
                <Checkbox disabled>
                  <div className="text-[#BFBFBF]">Invite</div>
                </Checkbox>
              </div>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default CreateEvent;
