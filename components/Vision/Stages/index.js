import {Steps, message} from "antd5"
import React, {useState, useEffect} from "react"
import BuildStatement from "./BuildStatement"
import Final from "./Final"
import GptResponse from "./GptResponse"
import axios from "axios"
import {db} from "../../../config/firebase-config"
import { useAuth } from "../../../contexts/AuthContext"

const Stages = ({vision = {type: "", value: "", features: [""], acceptedResponse: ""}, productId, setEditMode}) => {
  const {user} = useAuth();
	const [current, setCurrent] = useState(0)
	const [type, setType] = useState(vision.type)
	const [value, setValue] = useState(vision.value)
	const [features, setFeatures] = useState(vision.features)
	const [gptResponse, setGptResponse] = useState("")
	const [final, setFinal] = useState("")
	const [acceptedVision, setAcceptedVision] = useState(vision.acceptedResponse)
	const [step1, setStep1] = useState(true)
	const [step2, setStep2] = useState(false)
	const [step3, setStep3] = useState(false)

  const prevValue = vision.value;

	const createVision = () => {
		db.collection("Visions")
			.add({
				product_id: productId,
				type,
				value,
				features,
				acceptedVision,
			})
			.then((res) => {
        createEvent(res.id);
				setEditMode(false)
			})
	}

	const updateVision = () => {
		db.collection("Visions")
			.doc(vision.id)
			.update({
				type,
				value,
				features,
				acceptedVision,
			})
			.then(() => {
        createEvent(vision.id)
				setEditMode(false)
			})
	}

  const createEvent = (id) => {
    db.collection("VisionEvents").add({
      user: {
        id: user.uid,
        name: user.displayName,
      },
      prevValue,
      newValue: value,
      vision_id: id,
      createdAt: new Date().toISOString(),
    })
  }

	const gptQuestion = `Write a product vision for a ${type} app. It is ${value}. Which has the following features; ${features.map(
		(feature) => `${feature} `,
	)}.`

	const gptRequest = async () => {
		try {
			const response = await axios.post("/api/aiResponse", {
				prompt: gptQuestion,
			})
			// console.log(response.data.bot)
			setGptResponse(response.data.bot.trimStart())
		} catch (error) {
			console.log(error)
			message.error("Something went wrong!")
		}
	}

	useEffect(() => {
		if (current === 0) {
			setStep1(false)
			setStep2(true)
			setStep3(true)
		} else if (current === 1) {
			setStep1(true)
			setStep2(false)
			setStep3(true)
		} else {
			setStep1(true)
			setStep2(true)
			setStep3(false)
		}
	}, [current])

	return (
		<div id="stages">
			<Steps
				direction="vertical"
				current={current}
				items={[
					{
						title: (
							<BuildStatement
								setCurrent={setCurrent}
								type={type}
								setType={setType}
								value={value}
								setValue={setValue}
								features={features}
								setFeatures={setFeatures}
								createVision={createVision}
								updateVision={updateVision}
								gptRequest={gptRequest}
								id={vision.id}
								disabled={step1}
							/>
						),
					},
					{
						title: (
							<GptResponse
								gptResponse={gptResponse}
								setCurrent={setCurrent}
								setGptResponse={setGptResponse}
								disabled={step2}
								gptRequest={gptRequest}
								setAcceptedVision={setAcceptedVision}
							/>
						),
					},
					{
						title: (
							<Final
								setCurrent={setCurrent}
								acceptedVision={acceptedVision}
								setAcceptedVision={setAcceptedVision}
								disabled={step3}
								createVision={createVision}
								updateVision={updateVision}
								id={vision.id ? vision.id : null}
							/>
						),
					},
				]}
			/>
		</div>
	)
}

export default Stages
