"use client"

import { useState } from "react";
import { Steps, Button, Card, Input, Typography } from "antd";
import { CloseOutlined, RobotOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Title } = Typography;

const { Step } = Steps;

const steps = [
	{
		title: "Value Proposition",
		content: (
			<Card>
				<Title level={4}>What unique benefit are you offering to users?</Title>
				<TextArea rows={4} />
			</Card>
		),
	},
	{
		title: "Proposed Features",
		content: (
			<Card>
				<Title level={4}>Proposed Features</Title>
				{[1, 2, 3, 4, 5].map((index) => (
					<Input
						key={index}
						prefix={`${index}. `}
						suffix={<CloseOutlined />}
					/>
				))}
			</Card>
		),
	},
	{
		title: "Statement",
		content: (
			<Card
				title={
					<>
						<RobotOutlined style={{ marginRight: 8 }} />
						<span>ScrumGenie</span>
					</>
				}
				extra={<Button>Edit</Button>}
			>
				<TextArea rows={4} value="Default Vision Statement" />
			</Card>
		),
	},
];

const generateVisionStatement = async () => {
	// Function to generate vision statement
	return "Generated Vision Statement";
};

const VisionsClientPage = () => {
	const [current, setCurrent] = useState(0);
	const [visionStatement, setVisionStatement] = useState("");

	const next = () => {
		if (current === 1) {
			generateVisionStatement().then((statement) => setVisionStatement(statement));
		}
		setCurrent(current + 1);
	};

	const reset = () => {
		setCurrent(0);
		setVisionStatement("");
	};

	const save = () => {
		generateVisionStatement().then((statement) => setVisionStatement(statement));
		setCurrent(current + 1);
	};

	return (
		<>
			<Steps current={current} style={{ marginBottom: 32 }}>
				{steps.map((step) => (
					<Step key={step.title} title={step.title} />
				))}
			</Steps>
			<div>{steps[current].content}</div>
			<div style={{ marginTop: 32 }}>
				{current === steps.length - 1 ? (
					<Button type="primary" onClick={save}>
						Save
					</Button>
				) : (
					<Button type="primary" onClick={next}>
						Next
					</Button>
				)}
				{current > 0 && (
					<Button style={{ marginLeft: 8 }} onClick={() => setCurrent(current - 1)}>
						Previous
					</Button>
				)}
				{current === steps.length - 1 && (
					<Button style={{ marginLeft: 8 }} onClick={reset}>
						Reset
					</Button>
				)}
			</div>
			{current === 2 && (
				<div style={{ marginTop: 32 }}>
					<Title level={4}>Generated Vision Statement</Title>
					<p>{visionStatement}</p>
				</div>
			)}
		</>
	);
};

export default VisionsClientPage;
