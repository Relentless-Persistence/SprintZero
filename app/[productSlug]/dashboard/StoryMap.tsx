"use client"

import {ReadOutlined} from "@ant-design/icons"
import {useMutation} from "@tanstack/react-query"
import {Button} from "antd5"
import {useAnimationFrame} from "framer-motion"
import {useAtomValue, useSetAtom} from "jotai"

import type {FC} from "react"

import {calculateDividersAtom, elementsAtom, epicsAtom, pendingDomChangesAtom} from "./atoms"
import Epic from "./Epic"
import {useSubscribeToData} from "./utils"
import {addEpic} from "~/utils/fetch"
import {useActiveProductId} from "~/utils/useActiveProductId"

const StoryMap: FC = () => {
	const activeProduct = useActiveProductId()
	const elements = useAtomValue(elementsAtom)
	const calculateDividers = useSetAtom(calculateDividersAtom)
	const pendingDomChanges = useAtomValue(pendingDomChangesAtom)

	useAnimationFrame(() => {
		pendingDomChanges.forEach(({type, id}) => {
			const element = elements[id]
			if (type === `delete`) {
				if (!element?.isConnected) calculateDividers(id)
			} else {
				if (element) calculateDividers(id)
			}
		})
	})

	useSubscribeToData()

	const epics = useAtomValue(epicsAtom)

	const addEpicMutation = useMutation({
		mutationKey: [`add-epic`, activeProduct],
		mutationFn: activeProduct ? addEpic(activeProduct) : async () => {},
	})

	return (
		<div className="relative z-10 flex w-max gap-8">
			{epics.map((epic) => (
				<Epic key={epic.id} epic={epic} />
			))}
			<Button
				type="dashed"
				onClick={() => void addEpicMutation.mutate({name: `Epic`, description: `description`})}
				className="flex items-center bg-white transition-colors hover:bg-[#faf8ff]"
				style={{borderColor: `#4f2dc8`, color: `#4f2dc8`, padding: `0.25rem 0.5rem`}}
			>
				<ReadOutlined />
				<span>Add epic</span>
			</Button>
		</div>
	)
}

export default StoryMap
