"use client"

import clsx from "clsx"
import {motion} from "framer-motion"
import {useAtom} from "jotai"
import {useEffect, useRef} from "react"

import type {FC} from "react"
import type {Id} from "~/types"
import type {Epic as EpicType} from "~/types/db/Products"

import {dragStateAtom, useGetEpic} from "../atoms"
import {elementRegistry} from "../utils"
import EpicContent from "./EpicContent"
import FeatureList from "./FeatureList"
import SmallAddFeatureButton from "./SmallAddFeatureButton"

export type EpicProps = {
	productId: Id
	epic: EpicType
}

const Epic: FC<EpicProps> = ({productId, epic}) => {
	const [dragState, setDragState] = useAtom(dragStateAtom)

	const features = useGetEpic(epic.id).features

	const contentRef = useRef<HTMLDivElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		elementRegistry.epics[epic.id] = {
			content: contentRef.current,
			container: containerRef.current,
		}
		return () => {
			elementRegistry.epics[epic.id] = {
				// eslint-disable-next-line react-hooks/exhaustive-deps
				content: contentRef.current,
				// eslint-disable-next-line react-hooks/exhaustive-deps
				container: containerRef.current,
			}
		}
	}, [epic.id])

	return (
		<motion.div
			layoutId={epic.id}
			layout="position"
			className={clsx(`grid justify-items-center`, features.length === 0 && `px-4`)}
			style={{
				gridTemplateColumns: `repeat(${features.length}, auto)`,
				x: dragState.id === epic.id && dragState.pos[0] ? dragState.pos[0] : `0px`,
				y: dragState.id === epic.id && dragState.pos[1] ? dragState.pos[1] : `0px`,
			}}
			ref={containerRef}
		>
			<motion.div
				onPointerDown={(e) => {
					e.preventDefault()
					setDragState((prev) => ({...prev, id: epic.id, type: `epic`}))
				}}
				className="-m-4 cursor-grab touch-none p-4 transition-transform hover:scale-105"
			>
				<EpicContent productId={productId} epic={epic} ref={contentRef} />
			</motion.div>

			{/* Pad out the remaining columns in row 1 */}
			{Array(Math.max(features.length - 1, 0))
				.fill(null)
				.map((_, i) => (
					<div key={`row1-${i}`} />
				))}

			{/* Pad out the beginning columns in row 2 */}
			{Array(Math.max(features.length - 1, 1))
				.fill(null)
				.map((_, i) => (
					<div key={`row2-${i}`} className="relative h-10 w-full">
						{i === 0 && (
							<div className="absolute left-1/2 h-full w-px -translate-x-1/2 border border-dashed border-[#4f2dc8]" />
						)}
						{i > 0 && (
							<div className="absolute left-1/2 top-1/2 h-1/2 w-px -translate-x-1/2 border border-dashed border-[#4f2dc8]" />
						)}
						{i === 0 && features.length > 0 && (
							<div className="absolute top-1/2 left-1/2 h-px w-1/2 border border-dashed border-[#4f2dc8]" />
						)}
						{i > 0 && <div className="absolute top-1/2 left-0 h-px w-full border border-dashed border-[#4f2dc8]" />}
					</div>
				))}

			{features.length > 0 && (
				<div className="relative grid h-10 w-full place-items-center">
					<div className="absolute left-1/2 top-1/2 h-1/2 w-px -translate-x-1/2 border border-dashed border-[#4f2dc8]" />
					<div className="absolute top-1/2 left-0 h-px w-1/2 border border-dashed border-[#4f2dc8]" />

					<div className="relative z-10">
						<SmallAddFeatureButton productId={productId} epic={epic} />
					</div>
				</div>
			)}

			<FeatureList productId={productId} epic={epic} />
		</motion.div>
	)
}

export default Epic
