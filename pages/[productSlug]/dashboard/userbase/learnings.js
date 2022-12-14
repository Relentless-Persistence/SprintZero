/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from "react"
import Head from "next/head"
import {useRouter} from "next/router"
import {Radio, message, Empty, notification} from "antd"

import AppLayout from "../../../../components/Dashboard/AppLayout"
import {ActionFormCard, ActionFormCard2} from "../../../../components/Dashboard/FormCard"
import ItemCard from "../../../../components/Dashboard/ItemCard"
import {splitRoutes, timeScale} from "../../../../utils"
import MasonryGrid from "../../../../components/Dashboard/MasonryGrid"
import {RadioButtonWithFill} from "../../../../components/AppRadioBtn"
import {db} from "../../../../config/firebase-config"
import {activeProductState} from "../../../../atoms/productAtom"
import {useRecoilValue} from "recoil"
import {findIndex} from "lodash"

const names = ["Validated", "Assumed", "Disproven"]

export default function Learnings() {
	const {pathname} = useRouter()

	const activeProduct = useRecoilValue(activeProductState)
	const [data, setData] = useState(null)
	const [showAdd, setShowAdd] = useState(false)

	const [activeLearning, setActiveLearning] = useState(names[0])

	const [learningName, setLearningName] = useState(activeLearning)

	const [temp, setTemp] = useState(null)

	// Fetch data from firebase
	const fetchLearnings = async () => {
		if (activeProduct) {
			const res = db
				.collection("Learnings")
				.where("product_id", "==", activeProduct.id)
				.where("type", "==", activeLearning)
				.onSnapshot((snapshot) => {
					setData(snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()})))
					console.log(snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()})))
				})
		}
	}

	useEffect(() => {
		fetchLearnings()
	}, [activeProduct, activeLearning])

	const setLearning = (name, product) => {
		const learningIndex = findIndex(names, (o) => o === name)

		setActiveLearning(names[learningIndex])
	}

	const addItem = () => {
		setShowAdd(true)
	}

	const addItemDone = (item) => {
		console.log(item)
		const data = {
			name: item.title,
			description: item.description,
			type: activeLearning,
			product_id: activeProduct.id,
		}
		db.collection("Learnings")
			.add(data)
			.then((docRef) => {
				message.success("New item added successfully")
			})
			.catch((error) => {
				message.error("Error adding item")
			})
		setShowAdd(false)
	}

	const editItem = async (id, item) => {
		const data = temp
			? {
					name: item.title,
					description: item.description,
					type: temp,
			  }
			: {
					name: item.title,
					description: item.description,
			  }

		await db
			.collection("Learnings")
			.doc(id)
			.update(data)
			.then(() => {
				message.success("Learning updated successfully")
				if (temp) {
					notification.info({
						message: `Learning moved to new section`,
						description: (
							<p>
								<span className="font-semibold text-[#C82D73]">{item.title}</span> moved to{" "}
								<span className="font-semibold text-[#4A801D]">{temp}</span>
							</p>
						),
						placement: "bottomRight",
					})
					setTemp(null)
				}
			})
			.catch((err) => {
				console.log(err)
			})
	}

	const deleteItem = (id) => {
		db.collection("Learnings").doc(id).delete()
	}

	// const rightNav = getNames(data[activeProduct]);

	return (
		<div className="mb-8">
			<Head>
				<title>Dashboard | Sprint Zero</title>
				<meta name="description" content="Sprint Zero strategy learnings" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<AppLayout
				rightNavItems={names}
				activeRightItem={activeLearning}
				setActiveRightNav={setLearning}
				onMainAdd={addItem}
				hasMainAdd
				hasSideAdd={false}
				mainClass="mr-[130px]"
				breadCrumbItems={splitRoutes(pathname)}
			>
				<MasonryGrid>
					{showAdd ? (
						<ActionFormCard
							headerSmall
							className="mb-[16px]"
							onCancel={() => setShowAdd(false)}
							onSubmit={addItemDone}
							isDisabled={true}
							// extraItems={
							//   <Radio.Group
							//     className="mt-[12px] grid grid-cols-3"
							//     size="small"
							//   >
							//     {names.map((opt, i) => (
							//       <RadioButtonWithFill
							//         key={i}
							//         checked={opt === learningName}
							//         onChange={() => setLearningName(opt)}
							//         value={opt}
							//       >
							//         {opt}
							//       </RadioButtonWithFill>
							//     ))}
							//   </Radio.Group>
							// }
						/>
					) : null}

					{data &&
						data.map((res, i) => (
							<ItemCard
								extraItems={
									<Radio.Group className="mt-[12px] grid grid-cols-3" size="small">
										{names.map((opt, i) => (
											<RadioButtonWithFill key={i} checked={opt === res.type} onChange={() => setTemp(opt)} value={opt}>
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
				</MasonryGrid>
				{data?.length < 1 ? (
					<>
						{showAdd ? null : (
							<div className="flex p-20 items-center justify-center">
								<div
									style={{
										boxShadow:
											"0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12)",
									}}
									className="flex h-[187px] w-[320px] items-center justify-center rounded bg-white"
								>
									<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
								</div>
							</div>
						)}
					</>
				) : null}
			</AppLayout>
		</div>
	)
}
