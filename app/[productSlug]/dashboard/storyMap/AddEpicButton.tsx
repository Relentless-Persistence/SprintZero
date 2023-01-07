import {ReadOutlined} from "@ant-design/icons"
import {useMutation} from "@tanstack/react-query"
import {Button} from "antd5"

import type {FC} from "react"

import {addEpic} from "~/utils/api/mutations"
import {useActiveProductId} from "~/utils/useActiveProductId"

const AddEpicButton: FC = () => {
	const activeProduct = useActiveProductId()

	const addEpicMutation = useMutation({
		mutationKey: [`add-epic`, activeProduct],
		mutationFn: activeProduct ? addEpic(activeProduct) : async () => {},
	})

	return (
		<button
			type="button"
			onClick={() => void addEpicMutation.mutate({name: `Epic`, description: ``})}
			className="flex items-center gap-2 rounded-md border border-dashed border-[currentColor] bg-white px-2 py-1 text-[#4f2dc8] transition-colors hover:bg-[#faf8ff]"
		>
			<ReadOutlined />
			<span>Add epic</span>
		</button>
	)
}

export default AddEpicButton
