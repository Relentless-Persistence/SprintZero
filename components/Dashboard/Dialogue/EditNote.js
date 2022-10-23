/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { Row, Col, Menu, Button, Input, Form, Drawer, Select } from "antd";
import styled from "styled-components";

import { CloseOutlined } from "@ant-design/icons";
import ActionButtons from "../../Personas/ActionButtons";
import { db } from "../../../config/firebase-config";
import update from "immutability-helper";

const { TextArea } = Input;
const { Option } = Select;

const continents = [
  "Asia",
  "Antarcatica",
  "South America",
  "North America",
  "Europe",
  "Africa",
  "Oceania",
];

const education = [
  "Higher School",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctoral Degree",
];

const Title = styled.p`
  font-size: 16px;
  line-height: 24px;
  color: #8c8c8c;
  flex: none;
  margin: 4px 0px;
`;

const EditNote = ({
  visible,
  setVisible,
  dialogue,
  setDialogue,
  onSubmit,
  height = 378,
  activeProduct,
}) => {
  const [form] = Form.useForm();
  const [name, setName] = useState(dialogue.name);
  const [notes, setNotes] = useState(dialogue.notes);
  const [post, setPost] = useState(dialogue.post);
  const [region, setRegion] = useState(dialogue.name);
  const [type, setType] = useState(dialogue.type);
  const [edu, setEdu] = useState(dialogue.education);
  const [personas, setPersonas] = useState(null);

  const fetchPersonas = async () => {
    const res = db
      .collection("Personas")
      .where("product_id", "==", activeProduct.id)
      .onSnapshot((snapshot) => {
        setPersonas(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      });
  };

  useEffect(() => {
    fetchPersonas();
  }, []);

  const onClose = () => {
    setDialogue(null);
    setVisible(false);
  };

  const handleChangeTitle = (index, e) => {
    const newFormData = update(notes, {
      [index]: {
        title: {
          $set: e,
        },
      },
    });

    setNotes(newFormData);
  };

  const handleChangeResponse = (index, e) => {
    const newFormData = update(notes, {
      [index]: {
        response: {
          $set: e,
        },
      },
    });

    setNotes(newFormData);
  };

  const updateDialogue = (values) => {
    const data = {
      name,
      notes,
      post,
      region,
      type,
      education: edu,
      updatedAt: new Date().toISOString(),
    };

    db.collection("Dialogues").doc(dialogue.id).update(data);
  };

  const add = () => {
    setNotes([...notes, { title: "", response: "" }]);
  };

  return (
    <Drawer
      visible={visible}
      closable={false}
      height={height}
      placement={"bottom"}
      headerStyle={{
        background: "#F5F5F5",
      }}
      onClose={onClose}
      title={
        <Row>
          <Col span={10}>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Col>
          <Col offset={13} span={1}>
            <ActionButtons
              className="justify-end"
              onCancel={onClose}
              onSubmit={updateDialogue}
            />
          </Col>
        </Row>
      }
    >
      <Row gutter={[20, 20]}>
        <Col span={16}>
          <p>
            <strong>Notes</strong>
          </p>

          <div>
            {notes.map((note, i) => (
              <div key={i}>
                <Form.Item rules={[{ required: true }]}>
                  <Input
                    placeholder="Title"
                    value={note.title}
                    onChange={(e) => handleChangeTitle(i, e.target.value)}
                  />
                </Form.Item>

                <Form.Item rules={[{ required: true }]}>
                  <TextArea
                    autoSize={{ minRows: 6 }}
                    placeholder="Response"
                    value={note.response}
                    onChange={(e) => handleChangeResponse(i, e.target.value)}
                  />
                </Form.Item>
              </div>
            ))}

            <Button
              className="text-[#4A801D] border-[#4A801D]"
              onClick={() => add()}
            >
              Add More
            </Button>
          </div>
        </Col>

        <Col offset={3} span={4}>
          <div className="mb-3">
            <Title className="text-right">Stage</Title>
            <Select
              disabled
              defaultValue={dialogue.type}
              onChange={(value) => setType(value)}
              className="w-full"
            ></Select>
          </div>

          <div className="mb-3">
            <Title className="text-right">Assigned Persona</Title>
            <Select
              defaultValue={dialogue.post}
              onChange={(value) => setPost(value)}
              className="w-full"
            >
              {personas &&
                personas.map((type, i) => (
                  <Option key={i} value={type.role}>
                    {type.role}
                  </Option>
                ))}
            </Select>
          </div>

          <div className="mb-3">
            <Title className="text-right">Region</Title>
            <Select
              defaultValue={dialogue.region}
              onChange={(value) => setRegion(value)}
              className="w-full"
            >
              {continents.map((type, i) => (
                <Option key={i} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
          </div>

          <div className="mb-3">
            <Title className="text-right">Education Level</Title>
            <Select
              defaultValue={edu}
              onChange={(value) => setEdu(dialogue.id, value)}
              className="w-full"
            >
              {education.map((item, i) => (
                <Option key={i} value={item}>
                  {item}
                </Option>
              ))}
            </Select>
          </div>
        </Col>
      </Row>
    </Drawer>
  );
};

export { EditNote };
