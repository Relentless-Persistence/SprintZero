"use client"

/* eslint-disable react-hooks/exhaustive-deps */

import {Radio, message, Empty, notification, Breadcrumb, Button} from "antd5"
import {useState, useEffect} from "react"
import styled from "styled-components"

import {RadioButtonWithFill} from "~/components/AppRadioBtn"
import {LearningsActionFormCard} from "~/components/Dashboard/FormCard"
import {LearningsItemCard} from "~/components/Dashboard/ItemCard"
import MasonryGrid from "~/components/Dashboard/MasonryGrid"
import {db} from "~/config/firebase-config"
import {splitRoutes} from "~/utils"
import {useActiveProductId} from "~/utils/useActiveProductId"

const names = [`Validated`, `Assumed`, `Disproven`]

const Versions = styled.ul`
	list-style: none;
	color: #262626;
	font-size: 16px;
`

const Version = styled.li`
	border-left-width: 4px;
	border-left-style: solid;
	border-left-color: ${(props) => (props.active ? `#315613` : `#3156131a`)};
	cursor: pointer;
	padding-bottom: 28px;
	font-style: normal;
	font-weight: 400;
	font-size: 16px;
	line-height: 24px;
`

export default function Learnings() {
	const activeProductId = useActiveProductId()
	const [data, setData] = useState(null)
	const [showAdd, setShowAdd] = useState(false)
	const [breadCrumb, setBreadCrumb] = useState(null)
	const [activeLearning, setActiveLearning] = useState(names[0])

	const [temp, setTemp] = useState(null)

	useEffect(() => {
		if (activeLearning) {
			setBreadCrumb(splitRoutes(`userbase/learnings/${activeLearning}`))
		}
	}, [activeLearning])

	// Fetch data from firebase
	const fetchLearnings = async () => {
		if (activeProductId) {
			db.collection(`Learnings`)
				.where(`product_id`, `==`, activeProductId)
				.where(`type`, `==`, activeLearning)
				.onSnapshot((snapshot) => {
					setData(snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()})))
				})
		}
	}

	useEffect(() => {
		fetchLearnings()
	}, [activeProductId, activeLearning])

	const addItemDone = (item) => {
		const data = {
			name: item.title,
			description: item.description,
      artifact: item.artifact,
			type: activeLearning,
			product_id: activeProductId,
		}
		db.collection(`Learnings`)
			.add(data)
			.then(() => {
				message.success(`New item added successfully`)
			})
			.catch(() => {
				message.error(`Error adding item`)
			})
		setShowAdd(false)
	}

	const editItem = async (id, item) => {
		const data = temp
			? {
					name: item.title,
					description: item.description,
					artifact: item.artifact,
					type: temp,
			  }
			: {
					name: item.title,
					description: item.description,
					artifact: item.artifact,
			  }

		await db
			.collection(`Learnings`)
			.doc(id)
			.update(data)
			.then(() => {
				message.success(`Learning updated successfully`)
				if (temp) {
					notification.info({
						message: `Learning moved to new section`,
						description: (
							<p>
								<span className="font-semibold text-[#C82D73]">{item.title}</span> moved to{` `}
								<span className="font-semibold text-[#4A801D]">{temp}</span>
							</p>
						),
						placement: `bottomRight`,
					})
					setTemp(null)
				}
			})
			.catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err)
			})
	}

	const deleteItem = (id) => {
		db.collection(`Learnings`).doc(id).delete()
	}

	// const rightNav = getNames(data[activeProduct]);

	return (
		<div className="flex items-start justify-between">
			<div className="w-full">
				<div className="py-[24px] px-[42px]">
					<div className="mb-4 flex items-center justify-between">
						{breadCrumb && (
							<Breadcrumb>
								{breadCrumb.map((item, i) => (
									<Breadcrumb.Item className="capitalize" key={i}>
										{item}
									</Breadcrumb.Item>
								))}
							</Breadcrumb>
						)}

						<div>
							<Button className="bg-white hover:border-none hover:text-black" onClick={() => setShowAdd(true)}>
								Add New
							</Button>
						</div>
					</div>

					<div>
						<MasonryGrid>
							{data &&
								data.map((res) => (
									<LearningsItemCard
										extraItems={
											<Radio.Group className="mt-[12px] grid grid-cols-3" size="small">
												{names.map((opt, i) => (
													<RadioButtonWithFill
														key={i}
														checked={opt === res.type}
														onChange={() => setTemp(opt)}
														value={opt}
													>
														{opt}
													</RadioButtonWithFill>
												))}
											</Radio.Group>
										}
										// useBtn
										key={res.id}
										onEdit={(item) => editItem(res.id, item)}
										item={res}
										onDelete={() => deleteItem(res.id)}
									/>
								))}

							{showAdd ? (
								<LearningsActionFormCard
									headerSmall
									className="mb-[16px]"
									onCancel={() => setShowAdd(false)}
									onSubmit={addItemDone}
									// eslint-disable-next-line react/jsx-boolean-value
									isDisabled={true}
								/>
							) : null}
						</MasonryGrid>
						{data?.length < 1 ? (
							<>
								{showAdd ? null : (
									<div className="flex items-center justify-center p-20">
										<div
											style={{
												boxShadow: `0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12)`,
											}}
											className="flex h-[187px] w-[320px] items-center justify-center rounded bg-white"
										>
											<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
										</div>
									</div>
								)}
							</>
						) : null}
					</div>
				</div>
			</div>

			<div className="w-auto">
				<div>
					<Versions>
						{names.map((item, i) => (
							<Version
								className={`py-[16px] px-[24px]  ${activeLearning === item ? `font-[600]` : ``}`}
								key={i}
								active={activeLearning === item}
								onClick={() => setActiveLearning(item)}
							>
								{item.render ? item.render() : item}
							</Version>
						))}
					</Versions>
				</div>
			</div>
		</div>
	)
}
