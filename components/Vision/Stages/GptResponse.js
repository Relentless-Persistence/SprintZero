import React from 'react';
import {Button} from "antd"
import {Card, Input, Space, Typography, message, Skeleton} from "antd5";

const {TextArea} = Input;
const {Text} = Typography

const GptResponse = ({gptRequest, gptResponse, setCurrent, disabled, setGptResponse, setAcceptedVision}) => {
	const redo = () => {
		setGptResponse("")
		gptRequest()
	}

	const accept = () => {
		setAcceptedVision(gptResponse)
		setCurrent(2)
	}

	return (
		<div style={{width: "100%"}} className="mb-7">
			<div>
				<Text className="text-[16px]">ChatGPT Response</Text>
			</div>
			<div>
				<Text className="text-sm text-black/[0.45]">This is what we got back</Text>
			</div>

			<Card
				style={{
					boxShadow:
						"0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12)",
				}}
				className="mt-3"
			>
				{gptResponse ? gptResponse : <Skeleton active />}
			</Card>
			<Space className="mt-6 flex justify-end">
				<Button className="bg-white" disabled={disabled} onClick={redo}>
					Redo
				</Button>
				<Button
					disabled={disabled}
					onClick={accept}
					className="border-none bg-green-s500 text-white outline-none hover:border-none hover:bg-green-s400 hover:outline-none focus:outline-none"
				>
					Accept
				</Button>
			</Space>
		</div>
	)
}

export default GptResponse;
