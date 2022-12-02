"use client"

import clsx from "clsx"

import type {FC} from "react"

import {useStoryMapStore} from "./storyMapStore"

const layerBoundaries = [62, 164]

const VisualizeCellBoundaries: FC = () => {
	const dividers = useStoryMapStore((state) => state.dividers)

	return (
		<div className="pointer-events-none absolute inset-0 opacity-30">
			<div className="absolute w-full" style={{height: `${layerBoundaries[0]}px`, top: `0px`}}>
				{dividers[0]?.map((pos) => (
					<div
						key={`divider-0-${pos}`}
						className="absolute top-0 h-full border border-dashed border-[red]"
						style={{left: `${pos}px`}}
					/>
				))}
			</div>
			<div
				className="absolute w-full"
				style={{
					height: `${(layerBoundaries[1] ?? 0) - (layerBoundaries[0] ?? 0)}px`,
					top: `${layerBoundaries[0]}px`,
				}}
			>
				{dividers[1]?.map((divider) => (
					<div
						key={`divider-1-${divider.pos}`}
						className={clsx(
							`absolute top-0 h-full w-px border-dashed border-[green]`,
							divider.border ? `border-2` : `border`,
						)}
						style={{left: divider.pos}}
					/>
				))}
			</div>
			<div className="absolute w-full" style={{height: `300px`, top: `${layerBoundaries[1]}px`}}>
				{dividers[2]?.map((feature) => (
					<div
						key={`divider-2-${feature.featureId}`}
						className="absolute h-full"
						style={{left: `${feature.featureLeft}px`, width: `${feature.featureRight - feature.featureLeft}px`}}
					>
						{feature.dividers.map((pos) => (
							<div
								key={`divider-2-${feature.featureId}-${pos}`}
								className="absolute top-0 h-px w-full border border-dashed border-[blue]"
								style={{top: `${pos - layerBoundaries[1]!}px`}}
							/>
						))}
					</div>
				))}
			</div>
		</div>
	)
}

export default VisualizeCellBoundaries
