"use client"

import {FireFilled} from "@ant-design/icons"
import {zodResolver} from "@hookform/resolvers/zod"
import {Breadcrumb, Card, Dropdown} from "antd"
import {doc, updateDoc} from "firebase/firestore"
import {useEffect, useRef} from "react"
import {useDocument} from "react-firebase-hooks/firestore"
import {useForm} from "react-hook-form"
import {z} from "zod"

import type {FC} from "react"

import RhfInput from "~/components/rhf/RhfInput"
import RhfSegmented from "~/components/rhf/RhfSegmented"
import RhfSelect from "~/components/rhf/RhfSelect"
import {ProductConverter, ProductSchema} from "~/types/db/Products"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"
import {useUser} from "~/utils/useUser"

const formSchema = ProductSchema.pick({
	name: true,
	cadence: true,
	sprintStartDayOfWeek: true,
	effortCostCurrencySymbol: true,
}).extend({
	effortCost: z
		.string()
		.regex(/^(\.[0-9]{1,2}|([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.[0-9]{0,2})?)$/, `Invalid format.`)
		.nullable(),
})
type FormInputs = z.infer<typeof formSchema>

const ConfigurationSettingsClientPage: FC = () => {
	const user = useUser()
	const activeProductId = useActiveProductId()
	const [product] = useDocument(user ? doc(db, `Products`, activeProductId).withConverter(ProductConverter) : undefined)

	const {control, handleSubmit, reset} = useForm<FormInputs>({
		mode: `onChange`,
		resolver: zodResolver(formSchema),
		shouldFocusError: false,
		defaultValues: {
			name: product?.data()?.name,
			cadence: product?.data()?.cadence,
			sprintStartDayOfWeek: product?.data()?.sprintStartDayOfWeek,
			effortCost: product?.data()?.effortCost ? product.data()!.effortCost?.toString() : null,
			effortCostCurrencySymbol: product?.data()?.effortCostCurrencySymbol,
		},
	})

	const hasSetInitialData = useRef(false)
	useEffect(() => {
		if (!product?.exists() || hasSetInitialData.current) return
		reset({
			name: product.data().name,
			cadence: product.data().cadence,
			sprintStartDayOfWeek: product.data().sprintStartDayOfWeek,
			effortCost: product.data().effortCost ? product.data().effortCost?.toString() : null,
			effortCostCurrencySymbol: product.data().effortCostCurrencySymbol,
		})
		hasSetInitialData.current = true
	}, [product, reset])

	const onSubmit = handleSubmit(async (data) => {
		await updateDoc(doc(db, `Products`, activeProductId).withConverter(ProductConverter), {
			...data,
			effortCost: data.effortCost ? parseFloat(data.effortCost) : null,
		})
	})

	return (
		<div className="flex h-full flex-col gap-6 overflow-auto px-12 py-8">
			<Breadcrumb>
				<Breadcrumb.Item>Settings</Breadcrumb.Item>
				<Breadcrumb.Item>Configuration</Breadcrumb.Item>
			</Breadcrumb>

			<p className="text-xl font-semibold">Product Configuration</p>

			<Card className="w-fit">
				<form className="flex flex-col items-start gap-4">
					<label className="flex flex-col gap-1">
						<span className="font-semibold">Product Title</span>
						<RhfInput
							control={control}
							name="name"
							onChange={() => {
								onSubmit().catch(console.error)
							}}
							className="w-72"
						/>
					</label>

					<label className="flex flex-col gap-1">
						<span className="font-semibold">
							Cadence <span className="font-normal text-textTertiary">(Weeks)</span>
						</span>
						<RhfSegmented
							control={control}
							name="cadence"
							options={[
								{label: `One`, value: 1},
								{label: `Two`, value: 2},
								{label: `Three`, value: 3},
							]}
							onChange={() => {
								onSubmit().catch(console.error)
							}}
						/>
					</label>

					<label className="flex flex-col gap-1">
						<span className="font-semibold">Gate</span>
						<RhfSegmented
							control={control}
							name="sprintStartDayOfWeek"
							options={[
								{label: `Monday`, value: 1},
								{label: `Tuesday`, value: 2},
								{label: `Wednesday`, value: 3},
								{label: `Thursday`, value: 4},
								{label: `Friday`, value: 5},
							]}
							onChange={() => {
								onSubmit().catch(console.error)
							}}
							className="w-fit"
						/>
					</label>

					<label className="flex flex-col gap-1">
						<span className="font-semibold">Cost per Story Point</span>
						<RhfInput
							control={control}
							name="effortCost"
							number="currency"
							placeholder="0.00"
							onChange={() => {
								onSubmit().catch(console.error)
							}}
							addonAfter={
								<RhfSelect
									control={control}
									name="effortCostCurrencySymbol"
									onChange={() => {
										onSubmit().catch(console.error)
									}}
									options={[
										{label: `$`, value: `dollar`},
										{label: `£`, value: `pound`},
										{label: `€`, value: `euro`},
										{label: `¥`, value: `yen`},
										{label: `₹`, value: `rupee`},
									]}
								/>
							}
						/>
					</label>
				</form>
			</Card>

			<div className="flex flex-col gap-2">
				<div className="leading-normal">
					<p>Erase All Data</p>
					<p className="text-sm text-textTertiary">
						This action will erase all stored data and start over from scratch.
					</p>
				</div>
				<Dropdown.Button
					icon={<FireFilled className="relative -top-[2.5px] text-sm text-error" />}
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
	)
}

export default ConfigurationSettingsClientPage
