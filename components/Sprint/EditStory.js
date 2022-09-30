import React, {useState} from 'react';
import {
  List,
  Avatar,
  Form,
  Comment,
  Button,
  Input,
  Select,
  Row,
  Tag,
  Col,
  Radio,
  message,
  Space,
} from "antd";
import ResizeableDrawer from "../../components/Dashboard/ResizeableDrawer";
import { Title } from "../Dashboard/SectionTitle";
import AppCheckbox from "../AppCheckbox";
import RadioButton from "../AppRadioBtn";
import { findIndex } from 'lodash';

const { Option } = Select;

const EditStory = ({
  story,
  versions,
  name,
  setName,
  effort,
  setEffort,
  version,
  setVersion,
  status,
  setStatus,
  designLink,
  setDesignLink,
  codeLink,
  setCodeLink,
}) => {


  const getVersion = (id) => {
    if(versions && version) {
      const newArr = versions.filter((version) => version.id === id);
      if(newArr.length > 0) return newArr[0].version
    } else return 0;
  };

  return (
    <div className="space-y-6">
      <Row gutter={24}>
        <Col span={8}>
          <h6 className="text-gray-400 ">Title</h6>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Col>
        <Col span={6}>
          <h6 className="text-gray-400 ">Estimated Effort</h6>
          <Radio.Group
            defaultValue={effort}
            onChange={(e) => setEffort(e.target.value)}
            buttonStyle="solid"
            size="middle"
          >
            <Radio.Button value="1">1</Radio.Button>
            <Radio.Button value="2">2</Radio.Button>
            <Radio.Button value="3">3</Radio.Button>
            <Radio.Button value="5">5</Radio.Button>
            <Radio.Button value="8">8</Radio.Button>
            <Radio.Button value="13">13</Radio.Button>
          </Radio.Group>
        </Col>
        <Col span={2}>
          <h6 className="text-gray-400 ">Release</h6>
          <Select
            defaultValue={getVersion(version)}
            onChange={(value) => setVersion(value)}
            className="w-full"
          >
            {versions.map((version) => (
              <Option key={version.id} value={version.id}>
                {version.version}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={8}>
          <h6 className="text-gray-400 ">Status</h6>
          <Select
            defaultValue={status}
            onChange={(value) => setStatus(value)}
            className="w-full"
          >
            <Option value="Product Backlog">Product Backlog</Option>
            <Option value="Design Sprint Backlog">Design Sprint Backlog</Option>
            <Option value="Designing">Designing</Option>
            <Option value="Design Done / Dev Ready">
              Design Done / Dev Ready
            </Option>
            <Option value="Dev Sprint Backlog">Dev Sprint Backlog</Option>
            <Option value="Developing">Developing</Option>
            <Option value="Design Review">Design Review</Option>
            <Option value="QA">QA</Option>
            <Option value="Production Queue">Production Queue</Option>
            <Option value="Shipped">Shipped</Option>
          </Select>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={24}>
          <h6 className="text-gray-400 ">Design Link</h6>
          <Input
            value={designLink}
            onChange={(e) => setDesignLink(e.target.value)}
          />
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={24}>
          <h6 className="text-gray-400 ">Code Link</h6>
          <Input
            value={codeLink}
            onChange={(e) => setCodeLink(e.target.value)}
          />
        </Col>
      </Row>
    </div>
  );
};

export default EditStory;
