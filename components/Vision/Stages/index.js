import {Steps, message} from "antd5"
import {useAtomValue} from "jotai"
import {useQuery} from "@tanstack/react-query"
import React, {useState, useEffect} from "react"
import {getUser} from "~/utils/api/queries"
import BuildStatement from "./BuildStatement"
import Final from "./Final"
import GptResponse from "./GptResponse"
import axios from "axios"
import {db} from "../../../config/firebase-config"
import {useAuth} from "../../../contexts/AuthContext"
import {useUserId} from "~/utils/atoms"

const Stages = ({
	vision = {type: "", value: "", features: [""], gptResponse: "", acceptedResponse: ""},
	productId,
	setEditMode,
}) => {
	// const {user} = useAuth();
	const userId = useUserId()

	const [current, setCurrent] = useState(0)
	const [type, setType] = useState(vision.type)
	const [value, setValue] = useState(vision.value)
	const [features, setFeatures] = useState(vision.features)
	const [gptResponse, setGptResponse] = useState(vision.gptResponse)
	const [final, setFinal] = useState("")
	const [acceptedVision, setAcceptedVision] = useState(vision.acceptedVision)
	const [step1, setStep1] = useState(true)
	const [step2, setStep2] = useState(false)
	const [step3, setStep3] = useState(false)

	// const prevValue = vision.value;

	const {data: user} = useQuery({
		queryKey: [`user`, userId],
		queryFn: getUser(userId),
		enabled: userId !== undefined,
	})

	const createVision = () => {
		db.collection("Visions")
			.add({
				product_id: productId,
				type,
				value,
				features,
				gptResponse,
				acceptedVision,
			})
			.then((res) => {
				createEvent(res.id)
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
				gptResponse,
			})
			.then(() => {
				createEvent(vision.id)
				setEditMode(false)
			})
	}

	const createEvent = (id) => {
		db.collection("VisionEvents").add({
			user: {
				id: userId,
				name: user.name,
			},
			// prevValue,
			// newValue: value,
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

	useEffect(() => {
		if (vision.id) {
			setCurrent(2)
		}
	}, [])

	return (
		<div id="stages" className="w-full">
			<Steps
				onChange={(value) => {
					setCurrent(value)
				}}
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
								setGptResponse={setGptResponse}
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
								setEditMode={setEditMode}
							/>
						),
					},
				]}
			/>
		</div>
	)
}

export default Stages
