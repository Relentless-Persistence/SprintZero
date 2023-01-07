import React, {useState} from "react"
import {Card, Form, Typography, Input, Segmented, Space, message} from "antd5"
import {PlusCircleOutlined, MinusCircleOutlined} from "@ant-design/icons"
import {Button} from "antd"

const {Title, Text} = Typography

const BuildStatement = ({
	type,
	setType,
	value,
	setValue,
	features,
	setFeatures,
	setCurrent,
	gptRequest,
	disabled,
}) => {
	const addFeature = () => {
		const newList = [...features, ""]
		setFeatures(newList)
	}

	const removeFeature = (index) => {
		const newList = features.filter((_, i) => i !== index)
		setFeatures(newList)
	}

	const onChangeFeature = (value, i) => {
		const newList = [...features]
		newList[i] = value

		setFeatures(newList)
	}

	const onSubmit = async () => {
		if (type !== "" && value !== "" && features[0] !== "") {
			gptRequest()
			setCurrent(1)
		} else {
			message.error("Some fields are missing!")
		}
	}

	return (
		<div style={{width: "100%"}} className="mb-7">
			<div>
				<Text className="text-[16px]">Build Statement</Text>
			</div>
			<div>
				<Text className="text-sm text-black/[0.45]">What's this thing gonna be?</Text>
			</div>

			<Card
				style={{
					boxShadow:
						"0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12)",
				}}
				className="mt-3"
			>
				<Form layout="vertical">
					<Form.Item label={<span className="font-semibold">Type</span>} className="font-semibold">
						<Segmented
							disabled={disabled}
							value={type}
							options={["Mobile", "Tablet", "Desktop", "Watch", "Web"]}
							onChange={(value) => setType(value)}
						/>
					</Form.Item>

					<Form.Item label={<span className="font-semibold">Value Proposition</span>}>
						<Input
							value={value}
							onChange={(e) => setValue(e.target.value)}
							placeholder="eg. Making it easy to to create albums of photos/videos"
							disabled={disabled}
						/>
					</Form.Item>

					<Form.Item label={<span className="font-semibold">Features</span>}>
						{features.map((feature, i) => (
							<Input
                key={i}
								className="mb-2"
								prefix={
									<div className="flex items-center justify-between">
										{i !== 0 ? (
											<button className="mr-[5px] flex items-center" onClick={() => removeFeature(i)}>
												<MinusCircleOutlined
													style={{
														color: "#C82D73",
													}}
												/>
											</button>
										) : null}
									</div>
								}
								value={feature}
								onChange={(e) => onChangeFeature(e.target.value, i)}
								suffix={
									<div className="flex items-center justify-between">
										<button className="ml-[5px] flex items-center" onClick={addFeature}>
											<PlusCircleOutlined
												style={{
													color: "#009C7E",
												}}
											/>
										</button>
									</div>
								}
								disabled={disabled}
							/>
						))}
					</Form.Item>
				</Form>
			</Card>
			<Space className="mt-6 flex justify-end">
				<Button disabled={disabled}>Reset</Button>
				<Button
					disabled={disabled}
					className="border-none bg-green-s500 text-white hover:text-white outline-none hover:border-none hover:bg-green-s400 hover:outline-none focus:outline-none"
					onClick={onSubmit}
				>
					Submit
				</Button>
			</Space>
		</div>
	)
}

export default BuildStatement
