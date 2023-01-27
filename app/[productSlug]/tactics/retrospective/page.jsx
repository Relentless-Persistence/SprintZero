"use client"

/* eslint-disable react-hooks/exhaustive-deps */

// import {SortAscendingOutlined} from "@ant-design/icons"
import {useQuery} from "@tanstack/react-query"
import {Card, Avatar, message, Empty, Breadcrumb, Button} from "antd5"
// import {findIndex} from "lodash"
import {useState, useEffect} from "react"
import styled from "styled-components"

import AppCheckbox from "~/components/AppCheckbox"
import {CardHeaderLink} from "~/components/Dashboard/CardHeaderButton"
import {ActionFormCard} from "~/components/Dashboard/FormCard"
import MasonryGrid from "~/components/Dashboard/MasonryGrid"
import AddItem from "~/components/Retrospective/AddItem"
import EditItem from "~/components/Retrospective/EditItem"
import {db} from "~/config/firebase-config"
import {splitRoutes} from "~/utils"
import {getUser} from "~/utils/api/queries"
import {useUserId} from "~/utils/atoms"
import {useActiveProductId} from "~/utils/useActiveProductId"

const {Meta} = Card
const types = [`Enjoyable`, `Puzzling`, `Frustrating`]

const MyCard = styled(Card)`
	position: relative;
	border: 1px solid #d9d9d9;

	.ant-card-body {
		padding: 0;
	}

	.ant-card-meta {
		padding: 16px;
		background: #f5f5f5;
		border-bottom: 1px solid #d9d9d9;
		border-top: 1px solid #d9d9d9;

		.ant-card-meta-title {
			margin-bottom: 0;
		}
	}

	article {
		padding: 16px 16px 0;

		h5 {
			font-weight: bold;
		}

		p {
			font-style: italic;
		}
	}
`

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

export default function Retrospective() {
	const userId = useUserId()
	const {data: user} = useQuery({
		queryKey: [`user`, userId],
		queryFn: getUser(userId),
		enabled: userId !== undefined,
	})

	const userRole = `member`

	const activeProductId = useActiveProductId()
	const [data, setData] = useState(null)
	const [activeEditIndex, setActiveEditIndex] = useState(null)
	const [showAdd, setShowAdd] = useState(false)
	const [breadCrumb, setBreadCrumb] = useState(null)
	const [activeTabIndex, setActiveTabIndex] = useState(0)
	const [activeType, setActiveType] = useState(types[0])
	const [editMode, setEditMode] = useState(false)
	const [selectedRetro, setSelectedRetro] = useState(null)

	useEffect(() => {
		if (activeType) {
			setBreadCrumb(splitRoutes(`tactics/retrospective/${activeType}`))
		}
	}, [activeType])

	// Fetch data from firebase
	const fetchRetrospects = async () => {
		if (activeProductId) {
			db.collection(`Retrospectives`)
				.where(`product_id`, `==`, activeProductId)
				.where(`type`, `==`, activeType)
				.onSnapshot((snapshot) => {
					setData(snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()})))
				})
		}
	}

	useEffect(() => {
		fetchRetrospects()
	}, [activeProductId, activeType])

	const onEdit = async (item) => {
		const data = {
			title: item.title,
			description: item.description,
		}
		await db
			.collection(`Retrospectives`)
			.doc(item.id)
			.update(data)
			.then(() => {
				message.success(`Retrospective updated successfully`)
				setActiveEditIndex(null)
			})
			.catch(() => {
				message.error(`An error occurred`)
			})
	}

	const removeRetro = (id) => {
		db.collection(`Retrospectives`).doc(id).delete()
	}

	const updateRetroAction = (actionIndex, i, id) => {
		data[i].actions[actionIndex].completed = !data[i].actions[actionIndex].completed

		db.collection(`Retrospectives`).doc(id).update(data[i])
	}

	const editRetro = (item) => {
		setSelectedRetro(item)
		setEditMode(true)
	}

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

					{data?.length > 0 ? (
						<MasonryGrid>
							{data.map((c, i) =>
								i === activeEditIndex ? (
									<div key={i}>
										<ActionFormCard
											title={c.title}
											description={c.description}
											id={c.id}
											className="mb-[16px]"
											onCancel={() => setActiveEditIndex(null)}
											onSubmit={onEdit}
											onDelete={() => removeRetro(c.id)}
										/>
									</div>
								) : (
									<MyCard
										className="mb-[16px]"
										// extra={ user === c.name ? <CardHeaderLink>Edit</CardHeaderLink> : null }
										key={i}
									>
										<Meta
											className="flex items-center"
											avatar={
												<Avatar
													size={48}
													src={c.user?.photo}
													style={{
														border: `2px solid #315613`,
													}}
												/>
											}
											title={c.user?.name}
										/>

										{user && userRole !== `viewer` && user.id === c.user?.id ? (
											<CardHeaderLink onClick={() => editRetro(c)} className="absolute top-[28px] right-[16px]">
												Edit
											</CardHeaderLink>
										) : null}

										<article className="space-y-4">
											<div>
												<h5 className="font-semibold] text-[16px] text-[#595959]">{c.title}</h5>
												<p>{c.description}</p>
											</div>

											<div className="">
												<h5 className="font-semibold] text-[16px] text-[#595959]">Proposed Actions</h5>
												{c.actions.map((a, actionIndex) => (
													<div key={actionIndex}>
														<AppCheckbox
															key={a.label}
															checked={a.completed}
															onChange={() => updateRetroAction(actionIndex, i, c.id)}
														>
															{a.name}
														</AppCheckbox>
													</div>
												))}
											</div>
										</article>

										<br />
									</MyCard>
								),
							)}
						</MasonryGrid>
					) : (
						<div className="flex items-center justify-center">
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
					<AddItem
						show={showAdd}
						setShow={setShowAdd}
						user={user}
						product={activeProductId}
						type={types[activeTabIndex]}
					/>

					{selectedRetro && (
						<EditItem retro={selectedRetro} setRetro={setSelectedRetro} show={editMode} setEditMode={setEditMode} />
					)}
				</div>
			</div>

			<div className="w-auto">
				<div>
					<Versions>
						{types.map((item, i) => (
							<Version
								className={`py-[16px] px-[24px]  ${activeType === item ? `font-[600]` : ``}`}
								key={i}
								active={activeType === item}
								onClick={() => setActiveType(item)}
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
