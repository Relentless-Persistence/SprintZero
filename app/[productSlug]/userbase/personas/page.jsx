"use client"

/* eslint-disable react-hooks/exhaustive-deps */

import {Row, Col, Input, Space, Button} from "antd"
import {capitalize, findIndex} from "lodash"
import {useState, useEffect} from "react"
import {useRecoilValue} from "recoil"

import {activeProductState} from "~/atoms/productAtom"
import {ListCard, DescriptionCard, TimeLineCard} from "~/components/Personas"
import {db} from "~/config/firebase-config"
import {splitRoutes} from "~/utils"
import {useActiveProductId} from "~/utils/useActiveProductId"




export default function Personas() {
	const activeProductId = useActiveProductId()
	const [roles, setRoles] = useState(null)
	const [activeRole, setActiveRole] = useState(null)
	const [rightNav, setRightNav] = useState([])
	const [newRole, setNewRole] = useState(``)

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

	const createRole = () => {

		db.collection(`Personas`).add({
			role: capitalize(newRole),
			product_id: activeProductId,
			goals: [``],
			interactions: [``],
			dailyLife: [``],
			tasks: [``],
			responsibilities: [``],
			priorities: [``],
			frustrations: [``],
			changes: [``],
			description: ``,
		})
	}

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
		<div className="mb-8">
			<div>
				{roles && roles?.length < 1 ? (
					<div className="flex h-[450px] items-center justify-center">
						<div className="w-[320px] space-y-2">
							<h3 className="text-[24px] font-bold">Create Persona</h3>
							<p className="text-[14px]">Please provide a name</p>
							<Input value={newRole} onChange={(e) => setNewRole(e.target.value)} />
							<div className="flex justify-end space-x-2">
								<Button size="small" type="danger" ghost onClick={() => setNewRole(``)}>
									Cancel
								</Button>
								<Button
									className="border-none bg-[#4A801D] text-[14px] text-white hover:border-none hover:bg-[#5A9D24] hover:text-white"
									size="small"
									onClick={createRole}
								>
									Submit
								</Button>
							</div>
						</div>
					</div>
				) : (
					activeRole && (
						<Row gutter={[16, 16]}>
							<Col xs={{span: 24}} sm={{span: 12}}>
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
							</Col>
							<Col xs={{span: 24}} sm={{span: 12}}>
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
							</Col>
						</Row>
					)
				)}
			</div>
		</div>
	)
}
