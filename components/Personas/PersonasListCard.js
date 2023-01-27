import React, {useState, useEffect, useCallback} from "react"
import styled from "styled-components"

import {Card, Form, Button} from "antd5"
import {Input} from "antd5"

import {PlusCircleOutlined, MinusCircleOutlined} from "@ant-design/icons"

import {OL} from "./NumberList"

import {CardHeaderLink} from "../Dashboard/CardHeaderButton"
import ActionButtons from "./ActionButtons"
import {db} from "../../config/firebase-config"
import {capitalize, debounce} from "lodash"
import {useAuth} from "../../contexts/AuthContext"

const MyInput = styled(Input)`
	.ant-input-group-wrapper {
		position: relative;
	}

	.ant-input-group-addon {
		background: transparent;
	}

	.ant-input {
		border-left: none;
		border-right: ${(props) => (props.$removeRightBorder ? "none" : "")};
		padding: 5px 11px;
	}
`

const Add = styled(Button)`
	background: transparent !important;
	border: none;
	padding: 0;
	display: flex;
	align-items: center;
`

const MyCard = styled(Card)`
	.ant-card-head {
		border-bottom: 2px solid #d9d9d9;
	}
`

const PersonasListCard = ({handleEdit, title, cardData, id, product}) => {
	const userRole = "member"
	const [isEdit, setIsEdit] = useState(false)
	const [newPersona, setNewPersona] = useState()
	const [list, setList] = useState(cardData)

	useEffect(() => {
		if (cardData.length <= 0) {
			setList([
				{
					role: "",
					product_id: product,
					goals: [""],
					interactions: [""],
					dailyLife: [""],
					tasks: [""],
					responsibilities: [""],
					priorities: [""],
					frustrations: [""],
					changes: [""],
					description: "",
				},
			])
		}
	}, [cardData])

	const toggleEdit = () => setIsEdit((s) => !s)

	const onFinish = () => {
		// const values = list.filter((it) => it.trim().length > 0);
		// handleEdit(values);

		list.map(async (persona) => {
			if (!persona.id && persona.role !== "") {
				db.collection("Personas").add({
					role: persona.role,
					product_id: product,
					goals: [""],
					interactions: [""],
					dailyLife: [""],
					tasks: [""],
					responsibilities: [""],
					priorities: [""],
					frustrations: [""],
					changes: [""],
					description: "",
				})
			}
		})

		setIsEdit(false)
	}

	const onCancel = () => {
		setIsEdit(false)
	}

	const add = () => {
		const newList = [
			...list,
			{
				role: "",
				product_id: product,
				goals: [""],
				interactions: [""],
				dailyLife: [""],
				tasks: [""],
				responsibilities: [""],
				priorities: [""],
				frustrations: [""],
				changes: [""],
				description: "",
			},
		]
		setList(newList)
	}

	const addPersona = () => {
		db.collection("Personas")
			.add({
				role: newPersona,
				product_id: product,
				goals: [""],
				interactions: [""],
				dailyLife: [""],
				tasks: [""],
				responsibilities: [""],
				priorities: [""],
				frustrations: [""],
				changes: [""],
				description: "",
			})
			.then(() => {
				setNewPersona()
			})
	}

	const remove = (index, id) => {
		if (index === 0) {
			db.collection("Personas")
				.doc(id)
				.delete()
				.then(() => setIsEdit(false))
		}
		const newList = list.filter((_, i) => i !== index)
		setList(newList)
		db.collection("Personas").doc(id).delete()
	}

	const updatePersona = (value, id) => {
		db.collection("Personas").doc(id).update({role: value})
	}

	// This function is expensive but debounce doesn't work
	const onChange = (value, i) => {
		const newList = [...list]
		newList[i].role = value

		setList(newList)

		// debounce(() => updatePersona(e.target.value, id),
		//   2000
		// );
		// db.collection("Personas").doc(id).update({ role: value });
	}

	return isEdit ? (
		<Card
			className="border-2 border-[#D9D9D9]"
			extra={<ActionButtons onCancel={onCancel} onSubmit={onFinish} />}
			title={<p>{title}</p>}
			headStyle={{
				background: "#F5F5F5",
			}}
		>
			{list &&
				list.map((it, i) => (
					<Input
						key={i}
						value={it.role}
						className="mb-[12px]"
						onChange={(e) => onChange(e.target.value, i)}
						prefix={
							<div className="flex items-center justify-between">
								<button onClick={() => remove(i, it.id)} className="mr-[5px] flex items-center">
									<MinusCircleOutlined
										style={{
											color: "#C82D73",
										}}
									/>
								</button>
								{`${i + 1}.`}
							</div>
						}
						suffix={
							i === cardData.length - 1 ? (
								<button className="ml-[5px] flex items-center" onClick={add}>
									<PlusCircleOutlined
										style={{
											color: "#009C7E",
										}}
									/>
								</button>
							) : null
						}
					/>
				))}
		</Card>
	) : (
		<>
			{userRole && (
				<MyCard
					className="border-2 border-[#D9D9D9]"
					extra={
						userRole !== "viewer" ? (
							<CardHeaderLink size="small" onClick={toggleEdit}>
								Edit
							</CardHeaderLink>
						) : null
					}
					title={<p>{title}</p>}
					headStyle={{
						background: "#F5F5F5",
					}}
				>
					<OL>
						{cardData.length < 1 ? (
							<p>
								No{" "}
								<span className="cursor-pointer font-semibold" onClick={() => setIsEdit(true)}>
									{title}
								</span>{" "}
								Added Yet
							</p>
						) : (
							cardData.map((item, i) => <li key={i}>{item.role}</li>)
						)}
					</OL>
				</MyCard>
			)}
		</>
	)
}

export {PersonasListCard}
