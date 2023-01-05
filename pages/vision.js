/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from "react"
import Head from "next/head"
import {useRouter} from "next/router"

import AppLayout from "../components/Dashboard/AppLayout"
import StatementForm from "../components/Vision/StatementForm"

import {checkEmptyArray, checkEmptyObject, getTimeAgo, splitRoutes} from "../utils"
import {db} from "../config/firebase-config"
import {activeProductState} from "../atoms/productAtom"
import {useRecoilValue} from "recoil"

import {Row, Col, Typography, Button, Card, Tag, Timeline} from "antd5"

import Deck from "../components/Vision/Deck"
import {Steps} from "antd5"

const {Title, Text} = Typography

const generateRightNav = (items) => {
	if (!items?.length) {
		return ["Now"]
	}

	return items.map((it) => ({
		render: () => getTimeAgo(it.createdAt),
		value: it.createdAt,
	}))
}

const CustomDot = () => (
	<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle cx="5" cy="5" r="4" fill="white" stroke="#54A31C" stroke-width="2" />
	</svg>
)

export default function Visions() {
	const {pathname} = useRouter()
	const activeProduct = useRecoilValue(activeProductState)
	const [editMode, setEditMode] = useState(false);
	const [vision, setVision] = useState(null);
	const [events, setEvents] = useState(null)

	const fetchVisions = () => {
		db.collection('Visions')
			.where("product_id", "==", activeProduct.id)
			.onSnapshot((snapshot) => {
				setVision(snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}))[0])
			})
	}

	const fetchVisionEvents = () => {
		db.collection("VisionEvents")
			.where("product_id", "==", activeProduct.id)
			.onSnapshot((snapshot) => {
				setEvents(snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()})))
			})
	}

	const data =
		"\n\nOur project management app will provide users with an intuitive and comprehensive platform to manage their projects. It will enable users to easily create, assign, and track tasks, collaborate with team members, and monitor progress. The app will also provide users with powerful analytics tools to help them identify areas of improvement and optimize their workflow. \n\nAdditionally, the app will offer a variety of features such as notifications, reminders, and customizable dashboards to help users stay organized and on top of their projects. Our goal is to make project management easier and more efficient for everyone.".trimStart()

	return (
		<div className="mb-8">
			<Head>
				<title>Vision | Sprint Zero</title>
				<meta name="description" content="Sprint Zero strategy objectives" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<AppLayout
				// mainClass="mr-[160px]"
				breadCrumbItems={splitRoutes(pathname)}
				onMainAdd={() => setAddMode(true)}
				sideAdd={false}
				hideSideBar={true}
			>
				<Row gutter={42}>
					<Col span={18}>
						<div className="mb-5 flex items-start justify-between">
							<Title>Product Vision</Title>

							<Button className="bg-white hover:text-black " disabled={editMode} onClick={() => setEditMode(!editMode)}>
								Edit
							</Button>
						</div>

						<div>
							{!editMode ? (
								<Card
									className="border border-[#D9D9D9] p-[42px]"
									style={{boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.08), 1px -4px 4px rgba(0, 0, 0, 0.06)"}}
								>
									<div
										className="text-2xl"
										style={{whiteSpace: "pre-line"}}
										dangerouslySetInnerHTML={{__html: data}}
									></div>
								</Card>
							) : (
								"Editing"
							)}
						</div>
					</Col>

					<Col span={6}>
						<Tag className="mb-[18px]" color="#EEFCD9">
							<Text className="text-xs text-[#646464]">Changelog</Text>
						</Tag>

						<Timeline>
							<Timeline.Item color="#54A31C" className="">
								<p className="mb-[10px] font-courier text-xs">2 minutes ago</p>
								<p className="text-xs">
									<span className="text-[#1890FF]">@Matthew</span> modified <strong>“for all time”</strong> to{" "}
									<strong>“in my time”</strong>
								</p>
							</Timeline.Item>
							<Timeline.Item color="#54A31C" className="">
								<p className="mb-[10px] font-courier text-xs">2 minutes ago</p>
								<p className="text-xs">
									<span className="text-[#1890FF]">@Matthew</span> modified <strong>“for all time”</strong> to{" "}
									<strong>“in my time”</strong>
								</p>
							</Timeline.Item>
						</Timeline>
					</Col>
				</Row>
			</AppLayout>
		</div>
	)
}
