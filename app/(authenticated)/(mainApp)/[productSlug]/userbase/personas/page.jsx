"use client"

/* eslint-disable react-hooks/exhaustive-deps */

import {Card, Empty, Breadcrumb} from "antd"
import {findIndex} from "lodash"
import Link from "next/link"
import {useState, useEffect} from "react"
import styled from "styled-components"

import {ListCard, DescriptionCard, TimeLineCard} from "~/components/Personas"
import {splitRoutes} from "~/utils"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

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

export default function Personas() {
	const activeProductId = useActiveProductId()
	const [roles, setRoles] = useState(null)
	const [activeRole, setActiveRole] = useState(null)
	const [rightNav, setRightNav] = useState([])
	// const [newRole, setNewRole] = useState(``)
	const [breadCrumb, setBreadCrumb] = useState(null)

	useEffect(() => {
		if (activeRole) {
			setBreadCrumb(splitRoutes(`userbase/personas/${activeRole.role}`))
		}
	}, [activeRole])

	const fetchPersonas = async () => {
		if (activeProductId) {
			db.collection(`Personas`)
				.where(`product_id`, `==`, activeProductId)
				.orderBy(`role`)
				.onSnapshot((snapshot) => {
					setRoles(snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()})))
					const roles = snapshot.docs.map((doc) => ({
						id: doc.id,
						...doc.data(),
					}))
					setActiveRole(roles[0])
				})
		}
	}

	useEffect(() => {
		fetchPersonas()
	}, [activeProductId])

	const getRoles = () => {
		// return data.map((d) => d.role);
		if (roles) {
			setRightNav(roles.map(({role}) => role))
		}
	}

	useEffect(() => {
		getRoles()
	}, [roles])

	const setRole = (roleName) => {
		const roleIndex = findIndex(roles, (r) => r.role === roleName)

		if (roleIndex > -1) {
			setActiveRole(roles[roleIndex])
		}
	}

	// const createRole = () => {

	// 	db.collection(`Personas`).add({
	// 		role: capitalize(newRole),
	// 		product_id: activeProductId,
	// 		goals: [``],
	// 		interactions: [``],
	// 		dailyLife: [``],
	// 		tasks: [``],
	// 		responsibilities: [``],
	// 		priorities: [``],
	// 		frustrations: [``],
	// 		changes: [``],
	// 		description: ``,
	// 	})
	// }

	const handleEdit = (roleName, cardName, list, id) => {
		let data

		switch (cardName) {
			case `goals`:
				data = {
					goals: list,
				}
				break
			case `interactions`:
				data = {
					interactions: list,
				}
				break
			case `tasks`:
				data = {
					tasks: list,
				}
				break
			case `responsibilities`:
				data = {
					responsibilities: list,
				}
				break
			case `priorities`:
				data = {
					priorities: list,
				}
				break
			case `frustrations`:
				data = {
					frustrations: list,
				}
				break
			case `changes`:
				data = {
					changes: list,
				}
				break
			case `dailyLife`:
				data = {
					dailyLife: list,
				}
				break
			default:
				break
		}

		db.collection(`Personas`).doc(id).update(data)
	}

	const handleDescription = (value, id) => {
		db.collection(`Personas`).doc(id).update({description: value})
	}

	return (
		<div className="flex w-full items-start justify-between">
			<div className="w-full">
				<div className="py-[24px] px-[42px]">
					<div className="mb-4">
						{breadCrumb && (
							<Breadcrumb>
								{breadCrumb.map((item, i) => (
									<Breadcrumb.Item className="capitalize" key={i}>
										{item}
									</Breadcrumb.Item>
								))}
							</Breadcrumb>
						)}
					</div>

					<div>
						{roles && roles?.length < 1 ? (
							<div className="flex h-[400px] items-center justify-center">
								<Card
									className="h-[189px] w-[320px] border border-[#D9D9D9]"
									style={{boxShadow: `0px 4px 4px rgba(0, 0, 0, 0.08), 1px -4px 4px rgba(0, 0, 0, 0.06)`}}
								>
									<div className="flex items-center justify-center">
										<Empty
											image={Empty.PRESENTED_IMAGE_SIMPLE}
											description={
												<span>
													No Data. Go to{` `}
													<Link href={`/${activeProductId}/strategy/kickoff`} className="font-semibold text-[#1890FF]">
														Kickoff
													</Link>
													{` `}
													to add
												</span>
											}
										/>
									</div>
								</Card>
							</div>
						) : (
							activeRole && (
								<div className="flex space-x-4">
									<div className="w-full">
										<ListCard
											handleEdit={(list) => handleEdit(activeRole.role, `goals`, list, activeRole.id)}
											title="Goals"
											cardData={activeRole.goals}
										/>

										<br />

										<ListCard
											handleEdit={(list) => handleEdit(activeRole.role, `interactions`, list, activeRole.id)}
											title="Interactions"
											cardData={activeRole.interactions}
										/>

										<br />

										<ListCard
											handleEdit={(list) => handleEdit(activeRole.role, `tasks`, list, activeRole.id)}
											title="Tasks"
											cardData={activeRole.tasks}
										/>

										<br />

										<ListCard
											handleEdit={(list) => handleEdit(activeRole.role, `responsibilities`, list, activeRole.id)}
											title="Responsiblities"
											cardData={activeRole.responsibilities}
										/>

										<br />

										<ListCard
											handleEdit={(list) => handleEdit(activeRole.role, `priorities`, list, activeRole.id)}
											title="Priorities"
											cardData={activeRole.priorities}
										/>

										<br />

										<ListCard
											handleEdit={(list) => handleEdit(activeRole.role, `frustrations`, list, activeRole.id)}
											title="Frustations"
											cardData={activeRole.frustrations}
										/>

										<br />

										<ListCard
											handleEdit={(list) => handleEdit(activeRole.role, `changes`, list, activeRole.id)}
											title="Changes"
											cardData={activeRole.changes}
										/>
									</div>
									<div className="w-full">
										<DescriptionCard
											handleEdit={(value) => handleDescription(value, activeRole.id)}
											title="Description"
											name={activeRole?.id}
											cardData={activeRole?.description}
										/>

										<br />

										<TimeLineCard
											handleEdit={(list) => handleEdit(activeRole.role, `dailyLife`, list, activeRole.id)}
											title="A Day in the life"
											cardData={activeRole.dailyLife}
										/>
									</div>
								</div>
							)
						)}
					</div>
				</div>
			</div>

			<div className="w-auto">
				<div>
					<Versions>
						{rightNav.map((item, i) => (
							<Version
								className={`py-[16px] px-[24px]  ${activeRole?.role === item ? `font-[600]` : ``}`}
								key={i}
								active={activeRole?.role === item}
								onClick={() => setRole(item)}
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
