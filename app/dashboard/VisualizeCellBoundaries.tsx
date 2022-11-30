import type {FC} from "react"

import {useStoryMapStore} from "./storyMapStore"

const layerBoundaries = [62, 124]

const VisualizeCellBoundaries: FC = () => {
	const dividers = useStoryMapStore((state) => state.dividers)

	return (
		<div className="pointer-events-none absolute inset-0">
			<div className="absolute w-full" style={{height: `${layerBoundaries[0]}px`, top: `0px`}}>
				{dividers[0]?.map((divider) => (
					<div
						key={`divider-0-${divider.pos}`}
						className="absolute top-0 h-full w-px border-[1px] border-dashed border-[red]"
						style={{left: divider.pos}}
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
						className="absolute top-0 h-full w-px border-[1px] border-dashed border-[green]"
						style={{left: divider.pos}}
					/>
				))}
			</div>
			<div className="absolute w-full" style={{height: `300px`, top: `${layerBoundaries[1]}px`}}>
				{dividers[2]?.map((divider) => (
					<div
						key={`divider-2-${divider.pos}`}
						className="absolute top-0 h-full w-px border-[1px] border-dashed border-[blue]"
						style={{left: divider.pos}}
					/>
				))}
			</div>
		</div>
	)
}

export default VisualizeCellBoundaries
