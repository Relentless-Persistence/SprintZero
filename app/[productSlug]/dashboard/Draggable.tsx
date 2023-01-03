"use client"

import {motion} from "framer-motion"
import {useSetAtom} from "jotai"
import {forwardRef} from "react"

import type {ReactNode, FC, ForwardRefRenderFunction} from "react"
import type {Id} from "~/types"

import {reportPendingDomChangeAtom} from "./atoms"

export type DraggableProps = {
	children: ReactNode
	layer: number
	id: Id
}

const Draggable: ForwardRefRenderFunction<HTMLDivElement, DraggableProps> = ({children, layer, id}, ref) => {
	return (
		<motion.div drag dragSnapToOrigin data-layer={layer} ref={ref}>
			<div>{children}</div>
		</motion.div>
	)
}

export type InputProps = {
	id: Id
	value: string
	onChange: (value: string) => void
}

const Input: FC<InputProps> = ({id, value, onChange}) => {
	const reportPendingDomChange = useSetAtom(reportPendingDomChangeAtom)

	return (
		<div className="w-max">
			<input
				data-nondraggable
				value={value}
				onChange={(e) => {
					onChange(e.target.value)
					reportPendingDomChange({type: `update`, id})
				}}
				className="w-full grow bg-transparent text-center leading-none"
				size={1}
			/>
			<p className="h-0 overflow-hidden whitespace-pre text-[1em] opacity-0">{value}</p>
		</div>
	)
}

export default Object.assign(forwardRef(Draggable), {Input: Input})
