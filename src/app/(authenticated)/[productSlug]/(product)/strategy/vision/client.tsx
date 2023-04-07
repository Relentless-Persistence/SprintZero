"use client"

import { useState } from "react";
import { Steps, Button, Card, Input, Typography } from "antd";
import { CloseCircleOutlined, CloseOutlined, RobotOutlined } from "@ant-design/icons";
import { trpc } from "~/utils/trpc";
import { useAppContext } from "../../../AppContext";
import { doc, Timestamp, writeBatch } from "firebase/firestore";
import { nanoid } from "nanoid";
import { VisionUpdateConverter } from "~/types/db/Products/VisionUpdates";

const { TextArea } = Input;
const { Title } = Typography;

const { Step } = Steps;

const steps = [
	{
		title: "Value Proposition"
	},
	{
		title: "Proposed Features"
	},
	{
		title: "Statement"
	},
];

const generateVisionStatement = async () => {
	const [statementEditMode, setStatementEditMode] = useState(false);

	// Function to generate vision statement
	return "Generated Vision Statement";
};

const VisionsClientPage = () => {
	const { product, user } = useAppContext()
	const [current, setCurrent] = useState(0);
	const [statementEditMode, setStatementEditMode] = useState(false);

	const gpt = trpc.gpt.useMutation()

	const [features, setFeatures] = useState(['', '', '', '', '']);
	const [valueProposition, setValueProposition] = useState('');
	const [productVision, setProductVision] = useState<string | undefined>(undefined)
	const [generatingVision, setGeneratingVision] = useState(false)

	const handleFeatureChange = (index: number, value: string) => {
		const newFeatures = [...features];
		newFeatures[index] = value;
		setFeatures(newFeatures);
		console.log(newFeatures)
	};

	const next = () => {
		if (current === 1) {
			//generateVisionStatement().then((statement) => setVisionStatement(statement));
		}
		setCurrent(current + 1);
	};

	const reset = () => {
		setCurrent(0);
		setProductVision("");
	};

	return (
		<>
			<Steps current={current}>
				{steps.map((step) => (
					<Step key={step.title} title={step.title} />
				))}
			</Steps>


			{
				current === 0 && (
					<Card>
						<Title level={4}>What unique benefit are you offering to users?</Title>
						<TextArea value={valueProposition} onChange={(e) => setValueProposition(e.target.value)} rows={4} />
					</Card>
				)
			}

			{
				current === 1 && (
					<Card type="inner" title="Proposed Features">
						{features.map((feature, index) => (
							<Input
								key={index}
								className="mb-3"
								prefix={`${index + 1}.`}
								suffix={<CloseCircleOutlined />}
								value={feature}
								onChange={(e) => handleFeatureChange(index, e.target.value)}
							/>
						))}
					</Card>
				)
			}

			{
				current === 2 && (
					<Card
						title={
							!statementEditMode ?
								<>
									<RobotOutlined style={{ marginRight: 8 }} />
									<span>ScrumGenie</span>
								</> :
								<span onClick={() => setStatementEditMode(!statementEditMode)}>Cancel</span>
						}
						extra=
						{
							statementEditMode ?
								<span onClick={() => setStatementEditMode(!statementEditMode)}>Done</span> :
								<span onClick={() => setStatementEditMode(!statementEditMode)}>Edit</span>


						}
					>
						{
							statementEditMode ? <TextArea rows={4} onChange={(e) => setProductVision(e.target.value)} value={productVision} />
								:
								<p>{generatingVision ? "Generating vision statement..." : productVision}</p>

						}
					</Card>


				)
			}

			<div style={{ marginTop: 32 }}>
				{current === steps.length - 1 ? (
					<Button type="primary"
					// onClick={() => {
					// 	const operations: string[] = []

					// 	if (product.data().valueProposition !== valueProposition)
					// 		operations.push(`changed the value proposition to "${valueProposition}"`)

					// 	// Calculate product type diffs
					// 	if (product.data().productTypes !== productTypes) {
					// 		const differences = diffArrays(product.data().productTypes, data.productTypes)
					// 		const removals = differences
					// 			.filter((difference) => difference.removed)
					// 			.flatMap((difference) => difference.value)
					// 			.map((removal) => `"${productTypes.find((type) => type[0] === removal)![1]!}"`)
					// 		let removalsText = removals.length > 0 ? listToSentence(removals) : undefined
					// 		removalsText = removalsText
					// 			? `removed the product type${removals.length === 1 ? `` : `s`} ${removalsText}`
					// 			: undefined
					// 		if (removalsText) operations.push(removalsText)
					// 		const additions = differences
					// 			.filter((difference) => difference.added)
					// 			.flatMap((difference) => difference.value)
					// 			.map((addition) => `"${productTypes.find((type) => type[0] === addition)![1]!}"`)
					// 		let additionsText = additions.length > 0 ? listToSentence(additions) : undefined
					// 		additionsText = additionsText
					// 			? `added the product type${additions.length === 1 ? `` : `s`} ${additionsText}`
					// 			: undefined
					// 		if (additionsText) operations.push(additionsText)
					// 	}

					// 	// Calculate feature diffs
					// 	if (
					// 		dbFeatures?.docs.map((feature) => ({ id: feature.id, text: feature.data().text })) !==
					// 		data.features
					// 	) {
					// 		const differences = diffArrays(
					// 			dbFeatures?.docs.map((feature) => feature.data().text) ?? [],
					// 			data.features.map((feature) => feature.text),
					// 		)
					// 		const removals = differences
					// 			.filter((difference) => difference.removed)
					// 			.flatMap((difference) => difference.value)
					// 			.map((removal) => `"${removal}"`)
					// 		let removalsText = removals.length > 0 ? listToSentence(removals) : undefined
					// 		removalsText = removalsText
					// 			? `removed the feature${removals.length === 1 ? `` : `s`} ${removalsText}`
					// 			: undefined
					// 		if (removalsText) operations.push(removalsText)
					// 		const additions = differences
					// 			.filter((difference) => difference.added)
					// 			.flatMap((difference) => difference.value)
					// 			.map((addition) => `"${addition}"`)
					// 		let additionsText = additions.length > 0 ? listToSentence(additions) : undefined
					// 		additionsText = additionsText
					// 			? `added the feature${additions.length === 1 ? `` : `s`} ${additionsText}`
					// 			: undefined
					// 		if (additionsText) operations.push(additionsText)
					// 	}

					// 	const operationsText = listToSentence(operations).concat(`.`)

					// 	const batch = writeBatch(db)
					// 	if (product.data().finalVision === ``) {
					// 		batch.set(
					// 			doc(product.ref, `VisionUpdates`, nanoid()).withConverter(VisionUpdateConverter),
					// 			{
					// 				userId: user.id,
					// 				text: `created the product vision.`,
					// 				timestamp: Timestamp.now(),
					// 			},
					// 		)
					// 	} else if (operations.length > 0) {
					// 		batch.set(
					// 			doc(product.ref, `VisionUpdates`, nanoid()).withConverter(VisionUpdateConverter),
					// 			{
					// 				userId: user.id,
					// 				text: operationsText,
					// 				timestamp: Timestamp.now(),
					// 			},
					// 		)
					// 	}

					// 	batch.update(product.ref, {
					// 		finalVision: data.finalVision,
					// 		productTypes: data.productTypes,
					// 		valueProposition: data.valueProposition,
					// 	})
					// 	features.forEach((feature) => {
					// 		batch.set(doc(product.ref, `Features`, feature.id).withConverter(FeatureConverter), {
					// 			text: feature.text,
					// 		})
					// 	})
					// 	await batch.commit()

					// 	setEditMode(false)
					// }}
					>
						Save
					</Button>
				) : (
					(current === 1) ?
						<Button type="primary" onClick={async () => {
							console.log('clicked me to call gpt')
							try {
								setGeneratingVision(true)
								next()
								const data = await gpt.mutateAsync({
									prompt: `Write a product vision for a ${listToSentence(product.data().productTypes)} app. Its goal is to: ${valueProposition}. The app has the following features: ${features.join(',')}.`,
								});
								setProductVision(data.response?.trim())
								setGeneratingVision(false)
							} catch (error) {
								console.error(error);
							}

							// gpt
							// 	.mutateAsync({
							// 		prompt: `Write a product vision for a ${listToSentence(product.data().productTypes)} app. Its goal is to: ${valueProposition}. The app has the following features: ${features.join(
							// 			`, `,
							// 		)}.`,
							// 	})
							// 	.then((data) => {
							// 		console.log(data.response?.trim())
							// 		setProductVision(data.response?.trim())
							// 		next
							// 	})
							// 	.catch(console.error)
						}}>
							Next
						</Button>
						:
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
		</>
	);
};

export default VisionsClientPage;

const listToSentence = (list: string[]) => {
	if (list.length === 0) return ``
	if (list.length === 1) return list[0]!
	const last = list.pop()!
	return ['Tablet', 'Web']
	//`${list.join(`, `)}${list.length > 1 ? `,` : ``} and ${last}`
}