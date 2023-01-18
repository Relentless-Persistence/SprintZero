/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import {Row, Col, Breadcrumb} from "antd"
import {useState, useEffect} from "react"

import {db} from "../../../../config/firebase-config"
import {splitRoutes} from "../../../../utils"
import {ListCard, DescriptionCard, PersonasListCard} from "~/components/Personas"
import {useActiveProductId} from "~/utils/useActiveProductId"

const Kickoff = () => {
	const activeProductId = useActiveProductId()

	const breadCrumb = splitRoutes(`strategy/kickoff`)

	const [kick, setKick] = useState(null)
	const [personas, setPersonas] = useState(null)

	const fetchKickoff = async () => {
		db.collection(`kickoff`)
			.where(`product_id`, `==`, activeProductId)
			.onSnapshot((snapshot) => {
				if (snapshot.empty) {
					createKickoff()
				} else {
					setKick(snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()})))
				}
			})
	}

	useEffect(() => {
		fetchKickoff()
	}, [activeProductId])

	const fetchPersonas = async () => {
		if (activeProductId) {
			db.collection(`Personas`)
				.where(`product_id`, `==`, activeProductId)
				.onSnapshot((snapshot) => {
					setPersonas(snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()})))
				})
		}
	}

	useEffect(() => {
		fetchPersonas()
	}, [activeProductId])

	const createKickoff = async () => {
		await db.collection(`kickoff`).add({
			product_id: activeProductId,
			problem_statement: ``,
			success_metrics: [``],
			priorities: [``],
		})

		fetchKickoff()
	}

	const handleEdit = (roleName, cardName, list, id) => {
		let data

		switch (cardName) {
			case `success_metrics`:
				data = {
					success_metrics: list,
				}
				break
			case `priorities`:
				data = {
					priorities: list,
				}
				break
			default:
				break
		}

		db.collection(`kickoff`).doc(id).update(data)
	}

	const handleProblem = (value, id) => {
		db.collection(`kickoff`).doc(id).update({problem_statement: value})
	}

	return (
		<div className="py-[24px] px-[42px]">
			<div className="mb-4">
				<Breadcrumb>
					{breadCrumb.map((item, i) => (
						<Breadcrumb.Item className="capitalize" key={i}>
							{item}
						</Breadcrumb.Item>
					))}
				</Breadcrumb>
			</div>
			{kick && (
				<Row gutter={[16, 16]}>
					<Col xs={{span: 24}} sm={{span: 12}}>
						<DescriptionCard
							handleEdit={(value) => handleProblem(value, kick[0].id)}
							title="Problem Statement"
							name={kick[0].id}
							cardData={kick[0].problem_statement}
						/>

						<br />

						<ListCard
							handleEdit={(list) => handleEdit(kick[0].success_metrics, "success_metrics", list, kick[0].id)}
							title="Success Metrics"
							cardData={kick[0].success_metrics}
						/>

						<br />
					</Col>
					<Col xs={{span: 24}} sm={{span: 12}}>
						{personas && (
							<PersonasListCard
								handleEdit={(list) => handleEdit(kick[0].perosnas, `personas`, list, kick[0].id)}
								title="Identified Personas"
								cardData={personas}
								product={activeProductId}
							/>
						)}

						<br />

						<ListCard
							handleEdit={(list) => handleEdit(kick[0].priorities, `priorities`, list, kick[0].id)}
							title="Business Priorities"
							cardData={kick[0].priorities}
						/>
					</Col>
				</Row>
			)}
		</div>
	)
}

export default Kickoff
