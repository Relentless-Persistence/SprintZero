"use client"

/* eslint-disable react-hooks/exhaustive-deps */

import { Button, Empty, Breadcrumb, notification, Radio } from "antd5"
// import { useRouter } from "next/router"; 
import { useState, useRef, useEffect } from "react";
import styled from "styled-components"

import {RadioButtonWithFill} from "~/components/AppRadioBtn"
import FormCard from "~/components/Dashboard/FormCard";
import ItemCard from "~/components/Dashboard/ItemCard";
import MainSub from "~/components/Dashboard/MainSub";
import MasonryGrid from "~/components/Dashboard/MasonryGrid";
import { db } from "~/config/firebase-config";
import {splitRoutes} from "~/utils"
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


const challenges = [`Perceivable`, `Operable`, `Understandable`, `Robust`];

const Accessibility = () => {
  const activeProductId = useActiveProductId();
  const ref = useRef(null);

  const [data, setData] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [challengesData, setChallengesData] = useState(null);
  const [activeChallenge, setActiveChallenge] = useState(challenges[0]);
  const [breadCrumb, setBreadCrumb] = useState(null);
  const [temp, setTemp] = useState(null)

  useEffect(() => {
    if (activeChallenge) {
      setBreadCrumb(splitRoutes(`strategy/accessibility/${activeChallenge}`))
    }
  }, [activeChallenge])

  const fetchAccessibility = async () => {
    if (activeProductId) {
      db.collection(`Accessibility`)
        .where(`product_id`, `==`, activeProductId)
        .where(`type`, `==`, activeChallenge)
        .onSnapshot((snapshot) => {
          setData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });
    }
  };

  const fetchChallenges = async () => {
    if (data) {
      db.collection(`Challenges`)
				.where(`product_id`, `==`, activeProductId)
				.where(`accessibility_type`, `==`, activeChallenge)
				.onSnapshot((snapshot) => {
					setChallengesData(snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()})))
				})
    }
  };

  useEffect(() => {
    fetchAccessibility();
  }, [activeProductId, activeChallenge]);

  useEffect(() => {
    fetchChallenges();
  }, [data]);

  // const setChallenge = (challengeName) => {
  //   const activeChallengeIndex = findIndex(
  //     challenges,
  //     (o) => o === challengeName
  //   );
  //   setActiveChallenge(challenges[activeChallengeIndex]);
  // };

  const addItem = () => {
    const top =
      ref?.current?.getBoundingClientRect()?.top ||
      document?.documentElement?.scrollHeight;
    setShowAdd(true);

    window?.scrollTo({
      top,
      behavior: `smooth`,
    });
  };

  const addItemDone = (item) => {
    const data = {
      accessibility_type: activeChallenge,
      ...item,
      product_id: activeProductId,
    };
    db.collection(`Challenges`)
      .add(data)
      .then(() => {
        notification.success({
					message: `New item added successfully`,
					placement: `bottomRight`,
				})
      })
      .catch(() => {
        notification.error({
					message: `Error adding item`,
					placement: `bottomRight`,
				})
      });

    setShowAdd(false);
  };

  const editItem = async (id, item) => {
    await db
			.collection(`Challenges`)
			.doc(id)
			.update({
				name: item.title,
				description: item.description,
				accessibility_type: temp
			})
			.then(() => {
				notification.success({
					message: `Challenge updated successfully`,
					placement: `bottomRight`,
				})
			})
  };

  const deleteItem = async (id) => {
    db.collection(`Challenges`)
      .doc(id)
      .delete()
      .then(() => {
        notification.success({
					message: `Challenge successfully deleted!`,
					placement: `bottomRight`,
				})
      })
      .catch((error) => {
         notification.error({
						message: `Error removing document`,
						placement: `bottomRight`,
					})
        console.error(`Error removing document: `, error);
      });
  };

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
							<Button className="bg-white hover:border-none hover:text-black" onClick={addItem}>
								Add New
							</Button>
						</div>
					</div>

					<MainSub>
						{data && (
							<p>
								{data[0]?.title} To learn more visit{` `}
								<span className="font-semibold text-[#2D73C8]">
									<a href="https://www.w3.org/WAI/standards-guidelines/wcag/glance/" target="_blank" rel="noreferrer">
										WCAG 2.1 at a Glance
									</a>
								</span>
							</p>
						)}
					</MainSub>

					{challengesData && challengesData.length > 0 ? (
						<MasonryGrid>
							{challengesData.map((res) => (
								<ItemCard
									key={res.id}
									extraItems={
										<Radio.Group className="mt-[12px] grid grid-cols-3" size="small">
											{challenges.map((opt, i) => (
												<RadioButtonWithFill
													key={i}
													checked={opt === res.accessibility_type}
													onChange={() => setTemp(opt)}
													value={opt}
												>
													{opt}
												</RadioButtonWithFill>
											))}
										</Radio.Group>
									}
									onEdit={(item) => editItem(res.id, item)}
									onDelete={() => deleteItem(res.id)}
									item={res}
								/>
							))}
							<div
								style={{
									visibility: showAdd ? `visible` : `hidden`,
								}}
								ref={ref}
							>
								<FormCard onSubmit={addItemDone} onCancel={() => setShowAdd(false)} />
							</div>
						</MasonryGrid>
					) : (
						<>
							<br />
							<br />
							{showAdd ? (
								<MasonryGrid>
									<FormCard
										onSubmit={addItemDone}
										onCancel={() => setShowAdd(false)}
										titlePlaceholder="Title"
										descriptionPlaceholder="Possible Solution"
									/>
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
						</>
					)}
				</div>
			</div>

			<div className="w-auto">
				<div>
					<Versions>
						{challenges.map((item, i) => (
							<Version
								className={`py-[16px] px-[24px]  ${activeChallenge === item ? `font-[600]` : ``}`}
								key={i}
								active={activeChallenge === item}
								onClick={() => setActiveChallenge(item)}
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

export default Accessibility