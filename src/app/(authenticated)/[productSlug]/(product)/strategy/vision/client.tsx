"use client"

import { CloseCircleOutlined, CloseOutlined, RobotOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Input, Space, Steps, Typography } from "antd";
import { Timestamp, doc, writeBatch } from "firebase/firestore";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";

import type { LogEntry } from "~/utils/logger";


import { useAppContext } from "../../../AppContext";
import { VisionUpdateConverter } from "~/types/db/Products/VisionUpdates";
import { fetchLogs, logAction } from "~/utils/logger";
import { trpc } from "~/utils/trpc";

const { TextArea } = Input;
const { Title } = Typography;

const { Step } = Steps;

const steps = [
	{
		title: `Value Proposition`
	},
	{
		title: `Proposed Features`
	},
	{
		title: `Statement`
	},
];

const VisionsClientPage = () => {
	const { product, user } = useAppContext()
	const [logs, setLogs] = useState<LogEntry[]>()
	const [current, setCurrent] = useState(0);
	const [statementEditMode, setStatementEditMode] = useState(false);

	const gpt = trpc.gpt.useMutation()

	const [features, setFeatures] = useState([``, ``, ``, ``, ``]);
	const [valueProposition, setValueProposition] = useState(``);
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
		setProductVision(``);
	};

	useEffect(() => {
		fetchLogs(product.ref, `VISION`).then(data => {
			setLogs(data)
		}).catch(error => {
			console.error(`Error fetching logs:`, error)
		});
	});

	return (


		<div className="h-full overflow-auto px-12 pb-8">
			<div className="sticky top-0 z-10 flex flex-col gap-2 bg-bgLayout pt-8 pb-6">
				<Breadcrumb items={[{ title: `Strategy` }, { title: `Vision` }]} />
				<div className="leading-normal">
					<h1 className="text-4xl font-semibold">Vision statement</h1>
					<p className="text-base text-textSecondary">
						A concise and inspiring statement that outlines the long-term goal and purpose of a product
					</p>
				</div>
			</div>
			<div className="flex">
				<div className="w-2/3">
					<Steps current={current}>
						{steps.map((step) => (
							<Step key={step.title} title={step.title} />
						))}
					</Steps>

					<div className="flex flex-col mt-8">
						{
							current === 0 && (
								<Card type="inner" title="What unique benefit are you offering to users?">
									<div style={{ height: `210px`, overflow: `auto` }} className="pt-3 pb-3">
										<TextArea rows={8} value={valueProposition} onChange={(e) => setValueProposition(e.target.value)} />
									</div>
								</Card>
							)
						}

						{
							current === 1 && (
								<Card type="inner" title="Proposed Features">
									<div style={{ height: `210px`, overflow: `auto` }}>
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
									</div>
								</Card>
							)
						}

						{
							current === 2 && (
								<Card
									type="inner"
									title={
										!statementEditMode ?
											<Button icon={<RobotOutlined />}>ScrumGenie</Button> :
											<Button type="text" danger onClick={() => setStatementEditMode(!statementEditMode)}>Cancel</Button>
									}
									extra=
									{
										statementEditMode ?
											<Button type="text" onClick={() => setStatementEditMode(!statementEditMode)}>Done</Button> :
											<Button type="text" onClick={() => setStatementEditMode(!statementEditMode)}>Edit</Button>


									}
								>
									<div style={{ height: `210px`, overflow: `auto` }} className="pt-3 pb-3">
										{
											statementEditMode ? <TextArea rows={8} onChange={(e) => setProductVision(e.target.value)} value={productVision} />
												:
												<p>{generatingVision ? `Generating vision statement...` : productVision}</p>

										}
									</div>
								</Card>


							)
						}

						<div className="flex justify-end" style={{ marginTop: 26 }}>
							<Space wrap>
								{current === steps.length - 1 && (
									<Button type="text" style={{ marginLeft: 8 }} onClick={reset}>
										Reset
									</Button>
								)}
								{current > 0 && (
									<Button style={{ marginLeft: 8 }} onClick={() => setCurrent(current - 1)}>
										Previous
									</Button>
								)}
								{current === steps.length - 1 ? (
									<Button
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
										<Button onClick={async () => {
											try {
												setGeneratingVision(true)
												next()
												const data = await gpt.mutateAsync({
													prompt: `Write a product vision for a ${listToSentence(product.data().productTypes)} app. Its goal is to: ${valueProposition}. The app has the following features: ${features.join(`,`)}.`,
												});
												setProductVision(data.response?.trim())
												setGeneratingVision(false)
												const log: LogEntry = {
													userId: user.id,
													timestamp: new Date(),
													actionName: `GENERATE_VISION_STATEMENT`,
													actionGroup: `VISION`,
													actionType: `CREATE`
												}
												logAction(product.ref, log)
											} catch (error) {
												console.error(error);
											}
										}}>
											Next
										</Button>
										:
										<Button onClick={next}>
											Next
										</Button>
								)}
							</Space>
						</div>
					</div>
				</div>
				<div className="w-1/3">{
					fetchLogs(product.ref, `VISION`).then(data => {
						<>Hello</>
					})
				}</div>
			</div>
		</div>
	);
};

export default VisionsClientPage;

const listToSentence = (list: string[]) => {
	// if (list.length === 0) return ``
	// if (list.length === 1) return list[0]!
	// const last = list.pop()!
	// return `${list.join(`, `)}${list.length > 1 ? `,` : ``} and ${last}`
	return `Tablet`
}