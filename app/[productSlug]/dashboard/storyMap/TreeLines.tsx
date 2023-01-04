"use client"

import {useAtomValue} from "jotai"

import type {FC} from "react"

import {currentVersionAtom, dividersAtom, featuresAtom} from "./atoms"
import {avg} from "./utils"

const TreeLines: FC = () => {
	const currentVersion = useAtomValue(currentVersionAtom)
	const features = useAtomValue(featuresAtom)
	const dividers = useAtomValue(dividersAtom)

	const featureDividersByEpic: number[][] = [[]]
	dividers[1]?.forEach((divider, i) => {
		if (i % 2 === 0) featureDividersByEpic.at(-1)!.push(divider.pos)
		if (divider.border) featureDividersByEpic.push([])
	})

	return (
		<div className="pointer-events-none absolute inset-x-12 inset-y-2 z-0 translate-x-[-1.2px]">
			{dividers[0]
				?.filter((_, i) => i % 2 === 0)
				.map((pos) => (
					<div
						key={`divider-0-${pos}`}
						className="absolute top-[30px] h-[48px] border border-dashed border-[#4f2dc8]"
						style={{left: `${pos}px`}}
					/>
				))}
			{featureDividersByEpic.map((dividers) => (
				<div
					key={`divider-1-${dividers[0]}-${dividers.at(-1)!}`}
					className="absolute top-[54px] border border-dashed border-[#4f2dc8]"
					style={{
						left: `${dividers[0]}px`,
						width: `${dividers.at(-1)! - dividers[0]!}px`,
					}}
				/>
			))}
			<div className="absolute top-[54px] h-[24px] w-full">
				{dividers[1]
					?.filter((_, i) => i % 2 === 0)
					.slice(1)
					.map((divider) => (
						<div
							key={`divider-0-${divider.pos}`}
							className="absolute top-0 h-full border border-dashed border-[#4f2dc8]"
							style={{left: `${divider.pos}px`}}
						/>
					))}
			</div>
			<div className="absolute top-[108px] h-[48px] w-full">
				{dividers[2]
					?.filter((group) =>
						currentVersion === `__ALL_VERSIONS__`
							? features.find((feature) => feature.id === group.featureId)!.stories.length > 0
							: true,
					)
					.map((group) => avg(group.featureLeft, group.featureRight))
					.map((pos) => (
						<div
							key={`divider-1-${pos}`}
							className="absolute top-0 h-full w-px border border-dashed border-[#006378]"
							style={{left: `${pos}px`}}
						/>
					))}
			</div>
		</div>
	)
}

export default TreeLines
