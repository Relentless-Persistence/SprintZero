"use client"

import {FireOutlined} from "@ant-design/icons"
import {Breadcrumb, Dropdown, Input, Segmented} from "antd"
import {collection, doc, query, updateDoc, where} from "firebase/firestore"
import {useEffect, useState} from "react"
import {useCollectionData} from "react-firebase-hooks/firestore"

import type {FC} from "react"
import type {Product} from "~/types/db/Products"

import {ProductConverter} from "~/types/db/Products"
import {db} from "~/utils/firebase"
import roundToNearest from "~/utils/roundToNearest"
import {useUser} from "~/utils/useUser"

const ConfigSettingsPage: FC = () => {
	const user = useUser()
	const [allProducts] = useCollectionData(
		user
			? query(collection(db, `Products`), where(`members.${user.id}.type`, `==`, `editor`)).withConverter(
					ProductConverter,
			  )
			: undefined,
	)
	// Technically the user can be a part of multiple products, but this page is only designed for one for now.
	const firstProduct = allProducts?.[0]

	const [title, setTitle] = useState(firstProduct?.name)
	useEffect(() => {
		setTitle(firstProduct?.name)
	}, [firstProduct?.name])

	const [cadence, setCadence] = useState(firstProduct?.cadence)
	useEffect(() => {
		setCadence(firstProduct?.cadence)
	}, [firstProduct?.cadence])

	const [gate, setGate] = useState(firstProduct?.sprintStartDayOfWeek)
	useEffect(() => {
		setGate(firstProduct?.sprintStartDayOfWeek)
	}, [firstProduct?.sprintStartDayOfWeek])

	const [effortCost, setEffortCost] = useState(
		typeof firstProduct?.effortCost === `number` ? String(firstProduct.effortCost) : ``,
	)
	useEffect(() => {
		setEffortCost(typeof firstProduct?.effortCost === `number` ? String(firstProduct.effortCost) : ``)
	}, [firstProduct?.effortCost])

	return (
		<div className="flex flex-col gap-6 px-12 py-8">
			<Breadcrumb>
				<Breadcrumb.Item>Settings</Breadcrumb.Item>
				<Breadcrumb.Item>Configuration</Breadcrumb.Item>
			</Breadcrumb>

			<div className="flex flex-col gap-4">
				<p className="text-lg font-semibold">Configuration</p>

				<label className="flex flex-col gap-2">
					<span>Product Title</span>
					<Input
						value={title}
						onChange={(e) => {
							setTitle(e.target.value)
							updateDoc(doc(db, `Products`, firstProduct!.id), {name: e.target.value} satisfies Partial<Product>).catch(
								console.error,
							)
						}}
						className="w-72"
					/>
				</label>

				<label className="flex flex-col gap-2">
					<span>Cadence (Weeks)</span>
					<Segmented
						value={cadence}
						options={[
							{label: `One`, value: 1},
							{label: `Two`, value: 2},
							{label: `Three`, value: 3},
							{label: `Four`, value: 4},
						]}
						onChange={(value) => {
							setCadence(value as number)
							updateDoc(doc(db, `Products`, firstProduct!.id), {
								cadence: value as number,
							} satisfies Partial<Product>).catch(console.error)
						}}
						className="w-fit"
					/>
				</label>

				<label className="flex flex-col gap-2">
					<span>Gate</span>
					<Segmented
						value={gate}
						options={[
							{label: `Monday`, value: 1},
							{label: `Tuesday`, value: 2},
							{label: `Wednesday`, value: 3},
							{label: `Thursday`, value: 4},
							{label: `Friday`, value: 5},
						]}
						onChange={(value) => {
							setGate(value as number)
							updateDoc(doc(db, `Products`, firstProduct!.id), {
								sprintStartDayOfWeek: value as number,
							} satisfies Partial<Product>).catch(console.error)
						}}
						className="w-fit"
					/>
				</label>

				<label className="flex flex-col gap-2">
					<span>Cost per Story Point</span>
					<Input
						value={effortCost ? `$${effortCost}` : undefined}
						onChange={(e) => {
							setEffortCost(e.target.value.replace(/^\$/, ``).replace(/(\.[0-9]{2}).+$/, `$1`))
							const value =
								e.target.value === `` ? null : roundToNearest(parseFloat(e.target.value.replace(/[^0-9.]/, ``)), 0.01)
							updateDoc(doc(db, `Products`, firstProduct!.id), {effortCost: value} satisfies Partial<Product>).catch(
								console.error,
							)
						}}
						className="w-24"
					/>
				</label>

				<div className="mt-32 flex flex-col gap-2">
					<div>
						<p>Erase All Data</p>
						<p className="text-sm text-gray">This action will erase all stored data and start over from scratch.</p>
					</div>
					<Dropdown.Button
						icon={<FireOutlined className="relative -top-[2.5px] text-xs" />}
						menu={{
							items: [
								{
									key: `confirm`,
									label: `Confirm`,
									onClick: () => {
										// await Promise.all([
										// ])
									},
								},
								{key: `cancel`, label: `Cancel`},
							],
						}}
					>
						Halt + Catch Fire
					</Dropdown.Button>
				</div>
			</div>
		</div>
	)
}

export default ConfigSettingsPage
