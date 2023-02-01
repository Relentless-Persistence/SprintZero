import React, { useState, useEffect } from "react";
import moment from "moment";
import styled from "styled-components";
import {
  Row,
  Col,
  Input,
  Switch,
  Slider,
  Radio,
  DatePicker,
  TimePicker,
  Drawer,
  Button,
  notification,
} from "antd5";
import { Title } from "../SectionTitle";
import ActionButtons from "../../Personas/ActionButtons";
import ResizeableDrawer from "../../../components/Dashboard/ResizeableDrawer";

import { add, isWithinInterval } from "../../../utils";
import { db } from "../../../config/firebase-config";

const { TextArea } = Input;

const marks = {
  0: "0",
  25: "25",
  50: "50",
  75: "75",
  100: "100",
};

const MyRadioBtns = styled(Radio.Group)`
  .ant-radio-button-wrapper-checked {
    background-color: #4a801d !important ;
  }
`;

const init = {
  title: "",
  description: "",
  start: "",
  end: "",
  isDelighted: "1",
  level: 50,
  // participants: [
  //   {
  //     label: "Marketing",
  //     checked: false,
  //   },
  //   {
  //     label: "Administrative Assistant",
  //     checked: true,
  //   },
  //   {
  //     label: "Account Executive",
  //     checked: false,
  //   },
  //   {
  //     label: "Vice President of Marketing",
  //     checked: true,
  //   },
  //   {
  //     label: "Media Relations Coordinator",
  //     checked: true,
  //   },
  // ],
};

const capitalize = (text) =>
  `${text[0]?.toUpperCase()}${text?.substring(1).toLowerCase()}`;

const EditEvent = ({
  event,
  editEvent,
  setEditEvent,
  journeyStart,
  journeyDur,
  journeyType,
}) => {
  const [evt, setEvt] = useState({ ...event });
  const [participants, setParticipants] = useState([]);

  const validateEvtDur = (start, end) => {
    if (start && end) {
      //console.log( journeyStart );
      const jStart = new Date(journeyStart);
      const jEnd = add(jStart, {
				[`${journeyType}`]: journeyDur,
			})
      const validStart = isWithinInterval(new Date(start), {
        start: jStart,
        end: jEnd,
      });
      const validEnd = isWithinInterval(new Date(end), {
        start: jStart,
        end: jEnd,
      });
      return validStart && validEnd;
    }
    return false;
  };

  const handleNameChange = (e) => {
    setEvt({ ...evt, title: e.target.value });
  };

  const handleDescChange = (e) => {
    setEvt({ ...evt, description: e.target.value });
  };

  const handleTimeChange = (field, dateTime) => {
    let time = "";
    if (dateTime) {
      time = new Date(dateTime.$d).toISOString();
    }
    setEvt({ ...evt, [field]: time });
  };

  const handleLevelChange = (level) => {
    setEvt({ ...evt, level });
  };

  const handleEmotionChange = (e) => {
    setEvt({ ...evt, isDelighted: e.target.value });
  };

  const handleParticipants = (i) => {
    let newPersonas = evt.participants;
    newPersonas[i].checked = !newPersonas[i].checked;
    setEvt({ ...evt, participants: newPersonas });
  };

  const updateEvent = () => {
    const newEvt = {
      ...evt,
      isDelighted: !!+evt.isDelighted,
      id: new Date().getTime(),
    };

    const validTimes = validateEvtDur(newEvt.start, newEvt.end);

    if (!validTimes) {
      alert("The event duration does not fall within the journey duration");

      return;
    }

    let isValid = true;

    for (const field in newEvt) {
      isValid = isValid && newEvt[field] !== "";
    }

    if (isValid) {
      db.collection("journeyEvents")
				.doc(event.id)
				.update(evt)
				.then(() => notification.success({message: "Event updated!"}))
      setEditEvent(false);
      setEvt(null);
    } else {
      alert("Please fill all fields");
    }
  };

  const renderPicker = (field, time) => {
    switch (journeyType) {
      case "year":
        return (
          <DatePicker
            picker="year"
            onChange={(dateTime) => handleTimeChange(field, dateTime)}
            defaultValue={moment(new Date(time), "YYYY")}
            format={"YYYY"}
          />
        );

      case "year":
        return (
          <DatePicker
            picker="month"
            onChange={(dateTime) => handleTimeChange(field, dateTime)}
            defaultValue={moment(new Date(time), "MM/YYYY")}
            format={"MM/YYYY"}
          />
        );

      case "hour":
      case "minute":
      case "second":
        return (
          <TimePicker
            onChange={(dateTime) => handleTimeChange(field, dateTime)}
            defaultValue={moment(time, "HH:mm:ss")}
            format={"HH:mm:ss"}
          />
        );

      default:
        return (
          <DatePicker
            onChange={(dateTime) => handleTimeChange(field, dateTime)}
            defaultValue={moment(new Date(time), "DD/MM/YYYY")}
            format={"DD/MM/YYYY"}
          />
        );
    }
  };

  const onDelete = () => {
    db.collection("journeyEvents").doc(event.id).delete();
    setEditEvent(false);
  };

  return (
    <ResizeableDrawer
      destroyOnClose={true}
      title={
        <Row>
          <Col span={12} className="flex items-center space-x-4">
            <h1 className="font-semibold text-[#262626] text-[20px] leading-[28px]">
              Touchpoint
            </h1>
            <Button
              size="small"
              className="bg-[#FF4D4F] hover:bg-[#FF4D4F] text-white hover:border-none hover:text-white"
              onClick={onDelete}
            >
              Delete
            </Button>
          </Col>
          <Col span={12} className="flex items-center justify-end">
            <ActionButtons
              onCancel={() => setEditEvent(false)}
              onSubmit={updateEvent}
            />
          </Col>
        </Row>
      }
      placement={"bottom"}
      closable={false}
      open={editEvent}
      headerStyle={{
        background: "#F5F5F5",
      }}
    >
      <Row gutter={[10, 10]}>
        <Col span={10}>
          <Title className="mb-[8px]">Subject</Title>

          <Input
            onChange={handleNameChange}
            value={evt.title}
            placeholder="Event Name"
          />

          <Title className="mb-[8px] mt-[24px]">Description</Title>

          <TextArea
            onChange={handleDescChange}
            rows={4}
            value={evt.description}
            placeholder="Event Description"
          />
        </Col>

        <Col span={8}>
          <div className="flex items-center">
            <div className="mr-[8px]">
              <Title className="mb-[8px]">Start</Title>

              {renderPicker("start", evt.start)}
            </div>

            <div>
              <Title className="mb-[8px]">End</Title>

              {renderPicker("end", evt.end)}
            </div>
          </div>

          <Title className="mb-[8px] mt-[24px]">Emotion</Title>

          <MyRadioBtns
            onChange={handleEmotionChange}
            defaultValue="1"
            value={evt.isDelighted}
            buttonStyle="solid"
          >
            <Radio.Button size="small" value={false}>
              Frustrated
            </Radio.Button>
            <Radio.Button size="small" value={true}>
              Delighted
            </Radio.Button>
          </MyRadioBtns>

          <Title className="mb-[8px] mt-[24px]">Level</Title>

          <Slider
            trackStyle={{
              backgroundColor: "#F0F0F0",
            }}
            handleStyle={{
              borderColor: "#5A9D24",
            }}
            marks={marks}
            onChange={handleLevelChange}
            value={evt.level}
            defaultValue={50}
          />
        </Col>

        <Col span={6}>
          <Title className="mb-[8px]">Participants</Title>

          {evt.participants?.map((e, i) => (
            <div key={e.label} className="flex items-center">
              <Switch
                size="small"
                onChange={() => handleParticipants(i)}
                className={`${
                  e.checked ? "bg-[#4A801D]" : "bg-[#BFBFBF]"
                } mr-[8px]`}
                checked={e.checked}
              />
              <p>{e.label}</p>
            </div>
          ))}
        </Col>
      </Row>
    </ResizeableDrawer>
  );
};

export default EditEvent;
