import {CloseOutlined} from "@ant-design/icons"
import {useQuery} from "@tanstack/react-query"
import {Button, Drawer, Tag, Typography} from "antd5"
import TextArea from "antd5/es/input/TextArea"
import {useState} from "react"

import type {FC, ReactNode} from "react"
import type {Id} from "~/types"

import useMainStore from "~/stores/mainStore"
import {getProduct} from "~/utils/fetch"

type Props = {
	title: string
	itemType: string
	extra?: ReactNode
	data: {
		points: number
		onPointsChange?: (points: number) => void
		description: string
		onDescriptionChange: (value: string) => void
		checklist?: {
			title: string
			items: Array<{id: Id; label: string; checked: boolean}>
			onItemToggle: (id: Id) => void
		}
		comments: Id[]
		onCommentAdd: (comment: string, author: Id, type: `design` | `code`) => void
		onDelete: () => void
	}
	isOpen: boolean
	onClose: () => void
}

const ItemDrawer: FC<Props> = ({title, itemType, extra, data, isOpen, onClose}) => {
	const [editMode, setEditMode] = useState(false)

	const activeProductId = useMainStore((state) => state.activeProduct)
	const {data: activeProduct} = useQuery({
		queryKey: [`product`, activeProductId],
		queryFn: getProduct(activeProductId!),
		enabled: activeProductId !== null,
	})

	return (
		<Drawer
			title={title}
			placement="bottom"
			closable={false}
			extra={
				<div className="flex items-center gap-2">
					<div>
						<Tag color="#91d5ff">
							{data.points} point{data.points === 1 ? `` : `s`}
						</Tag>
						{activeProduct?.cost && <Tag color="#a4df74">${activeProduct.cost * data.points}</Tag>}
						{extra}
						{!editMode && (
							<button type="button" onClick={() => void setEditMode(true)} className="text-sm text-[#396417]">
								Edit
							</button>
						)}
						{editMode && (
							<button type="button" onClick={() => void data.onDelete()}>
								<Tag color="#cf1322">Delete</Tag>
							</button>
						)}
					</div>

					<div className="grow" />

					{editMode ? (
						<>
							<Button size="small" onClick={() => void setEditMode(false)}>
								Cancel
							</Button>
							<Button size="small" onClick={() => void setEditMode(false)}>
								Done
							</Button>
						</>
					) : (
						<button type="button" onClick={() => void onClose()}>
							<CloseOutlined />
						</button>
					)}
				</div>
			}
			className="[&_.ant-drawer-header-title]:flex-[0_0_auto] [&_.ant-drawer-extra]:flex-[1_1_0%]"
			headerStyle={{gap: `1rem`}}
			open={isOpen}
			onClose={() => void onClose()}
		>
			<div className="grid grid-cols-2 gap-4">
				<div>
					<Typography.Title level={4}>{itemType}</Typography.Title>
					<TextArea value={data.description} onChange={(e) => void data.onDescriptionChange(e.target.value)} />
				</div>
				<div>
					<Typography.Title level={4}>Comments</Typography.Title>
				</div>
			</div>
		</Drawer>
	)
}

export default ItemDrawer
