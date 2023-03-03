"use client"

import {Button} from "antd"

import type {FC} from "react"

import {trpc} from "~/utils/trpc"

const AdminClientPage: FC = () => {
	const migrateSchema = trpc.migrateSchema.useMutation()

	return (
		<div>
			<h1>Migrate Schema</h1>
			<Button
				type="primary"
				onClick={() => {
					migrateSchema.mutateAsync().catch(console.error)
				}}
			>
				Do it
			</Button>
		</div>
	)
}

export default AdminClientPage
