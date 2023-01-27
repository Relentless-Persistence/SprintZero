"use client"

/* eslint-disable react-hooks/exhaustive-deps */

import {Typography, Button, Card, Tag, Timeline, Breadcrumb, notification, Empty} from "antd5"
import {formatDistance} from "date-fns"
import {useState, useEffect} from "react"

import Stages from "~/components/Vision/Stages"
import {db} from "~/config/firebase-config"
import {splitRoutes} from "~/utils"
import {useActiveProductId} from "~/utils/useActiveProductId"

const {Title, Text} = Typography

export default function Visions() {
	const activeProductId = useActiveProductId()
	const breadCrumb = splitRoutes(`strategy/vision`)

	const [editMode, setEditMode] = useState(false)
	const [vision, setVision] = useState(null)
	const [events, setEvents] = useState([])

	const fetchVisions = () => {
		if (activeProductId) {
			db.collection(`Visions`)
				.where(`product_id`, `==`, activeProductId)
				.onSnapshot((snapshot) => {
					if (snapshot.empty === true) {
						setEditMode(true)
					} else {
						setVision(snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}))[0])
					}
				})
		}
	}

	useEffect(() => {
		fetchVisions()
	}, [activeProductId])

	const fetchVisionEvents = () => {
		if (vision) {
			db.collection(`VisionEvents`)
				.where(`vision_id`, `==`, vision.id)
				.orderBy(`createdAt`, `desc`)
				.onSnapshot((snapshot) => {
					setEvents(snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()})))
				})
		}
	}

	useEffect(() => {
		fetchVisionEvents()
	}, [vision])

	const getLastUpdate = (date) => {
		if (date) return formatDistance(new Date(date), new Date(), {includeSeconds: true}) + ` ago`
	}

	return (
		<div className="py-[24px]">
			<div className="mb-4 px-[42px]">
				<Breadcrumb>
					{breadCrumb.map((item, i) => (
						<Breadcrumb.Item className="capitalize" key={i}>
							{item}
						</Breadcrumb.Item>
					))}
				</Breadcrumb>
			</div>

			<div className="flex items-start justify-between">
				<div className="w-full">
					<div className="px-[42px]">
						<div className="mb-5 flex items-start justify-between">
							<Title>Product Vision</Title>

							<Button className="bg-white hover:text-black " disabled={editMode} onClick={() => setEditMode(true)}>
								Edit
							</Button>
						</div>

						<div>
							{editMode === false ? (
								<Card
									className="border border-[#D9D9D9] p-[42px]"
									style={{boxShadow: `0px 4px 4px rgba(0, 0, 0, 0.08), 1px -4px 4px rgba(0, 0, 0, 0.06)`}}
								>
									{vision && vision ? (
										<div
											className="text-[16px]"
											style={{whiteSpace: `pre-line`}}
											dangerouslySetInnerHTML={{__html: vision.acceptedVision}}
										></div>
									) : (
										<div className="flex items-center justify-center">
											<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
										</div>
									)}
								</Card>
							) : vision ? (
								<Stages vision={vision} setEditMode={setEditMode} productId={activeProductId} />
							) : (
								<Stages setEditMode={setEditMode} productId={activeProductId} />
							)}
						</div>
					</div>
				</div>

				<div className="w-auto">
					<Tag className="mb-[18px]" color="#EEFCD9">
						<Text className="text-xs text-[#646464]">Changelog</Text>
					</Tag>

					<Timeline>
						{events &&
							(events.length <= 0 ? (
								<Timeline.Item color="#54A31C">No Changes Yet</Timeline.Item>
							) : (
								events.map((event, i) => (
									<Timeline.Item color="#54A31C" key={i}>
										<p className="mb-[10px] font-courier text-xs">{getLastUpdate(event.createdAt)}</p>

										{i === 0 ? (
											<p className="text-xs">
												<span className="text-[#1890FF]">@{event.user.name}</span> updated the product vision.
											</p>
										) : (
											<p className="text-xs">
												<span className="text-[#1890FF]">@{event.user.name}</span> created Product Vision.
											</p>
										)}
									</Timeline.Item>
								))
							))}
					</Timeline>
				</div>
			</div>
		</div>
	)
}
