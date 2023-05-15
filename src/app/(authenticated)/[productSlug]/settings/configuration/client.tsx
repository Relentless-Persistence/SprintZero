"use client"

import { FireFilled } from "@ant-design/icons"
import { zodResolver } from "@hookform/resolvers/zod"
import { Breadcrumb, Button, Card, Popconfirm } from "antd"
import { updateDoc } from "firebase/firestore"
import { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import type { FC } from "react"

import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import RhfInput from "~/components/rhf/RhfInput"
import RhfSegmented from "~/components/rhf/RhfSegmented"
import RhfSelect from "~/components/rhf/RhfSelect"
import { ProductSchema } from "~/types/db/Products"
import { auth } from "~/utils/firebase"
import { trpc } from "~/utils/trpc"

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
	const { product } = useAppContext()

	const { control, handleSubmit, reset } = useForm<FormInputs>({
		mode: `onChange`,
		resolver: zodResolver(formSchema),
		shouldFocusError: false,
		defaultValues: {
			name: product.data().name,
			cadence: product.data().cadence,
			sprintStartDayOfWeek: product.data().sprintStartDayOfWeek,
			effortCost: product.data().effortCost ? product.data()!.effortCost?.toString() : null,
			effortCostCurrencySymbol: product.data().effortCostCurrencySymbol,
		},
	})

	const hasSetInitialData = useRef(false)
	useEffect(() => {
		if (!product.exists() || hasSetInitialData.current) return
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
		await updateDoc(product.ref, {
			...data,
			effortCost: data.effortCost ? parseFloat(data.effortCost) : null,
		})
	})

	const haltAndCatchFire = trpc.product.haltAndCatchFire.useMutation()

	return (
		<div className="flex h-full flex-col gap-6 overflow-auto px-12 py-8">
			<div className="flex flex-col gap-2">
				<Breadcrumb items={[{ title: `Settings` }, { title: `Configuration` }]} />
				<h1 className="text-3xl font-bold">Product Configuration</h1>
			</div>

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
								{ label: `One`, value: 1 },
								{ label: `Two`, value: 2 },
								{ label: `Three`, value: 3 },
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
								{ label: `Monday`, value: 1 },
								{ label: `Tuesday`, value: 2 },
								{ label: `Wednesday`, value: 3 },
								{ label: `Thursday`, value: 4 },
								{ label: `Friday`, value: 5 },
							]}
							onChange={() => {
								onSubmit().catch(console.error)
							}}
							className="w-fit"
						/>
					</label>

					<label className="flex flex-col gap-1">
						<span className="font-semibold">
							Cost per Story Point <span className="font-normal text-textTertiary">(optional)</span>
						</span>
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
										{ label: `$`, value: `dollar` },
										{ label: `£`, value: `pound` },
										{ label: `€`, value: `euro` },
										{ label: `¥`, value: `yen` },
										{ label: `₹`, value: `rupee` },
									]}
								/>
							}
						/>
					</label>
				</form>
			</Card>

			<div className="flex flex-col items-start gap-2">
				<div className="leading-normal">
					<h2 className="font-semibold">Erase All Data</h2>
					<p className="text-sm text-textTertiary">
						This action will erase all stored data and start over from scratch.
					</p>
				</div>
				<Popconfirm
					title="Delete Product"
					description="Are you sure you want to do this? This action is not reversable."
					rootClassName="max-w-xs"
					placement="right"
					okText="Yes"
					cancelText="No"
					onConfirm={() => {
						auth
							.currentUser!.getIdToken(true)
							.then(async (userIdToken) => {
								await haltAndCatchFire.mutateAsync({ productId: product.id, userIdToken })
							})
							.catch(console.error)
						// router.push(`/`)
					}}
				>
					<Button icon={<FireFilled className="relative -top-[2.5px] text-sm text-error" />}>Halt + Catch Fire</Button>
				</Popconfirm>
			</div>
		</div>
	)
}

export default ConfigurationSettingsClientPage
