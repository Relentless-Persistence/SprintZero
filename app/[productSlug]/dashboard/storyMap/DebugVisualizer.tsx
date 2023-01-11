import {useAnimationFrame} from "framer-motion"
import {useAtomValue} from "jotai"
import {Fragment, useState} from "react"

import type {FC} from "react"

import {storyMapStateAtom} from "./atoms"
import {calculateBoundaries, epicBoundaries, featureBoundaries, layerBoundaries, storyBoundaries} from "./utils"

const leftOffset = 248

const DebugVisualizer: FC = () => {
	const [, setRandom] = useState(0)
	const storyMapState = useAtomValue(storyMapStateAtom)

	useAnimationFrame(() => {
		calculateBoundaries(storyMapState)
		setRandom(Math.random())
	})

	return (
		<div className="pointer-events-none absolute inset-0">
			<div className="absolute w-full" style={{height: layerBoundaries[0]}}>
				{storyMapState
					.map((epic) => [epic.id, epicBoundaries[epic.id]] as const)
					.filter(([, boundaries]) => boundaries !== undefined)
					.map(([id, boundaries]) => [id, boundaries!] as const)
					.map(([id, boundaries]) => (
						<Fragment key={id}>
							<div className="absolute h-full w-px bg-black" style={{left: `${boundaries.left - leftOffset}px`}} />
							<div className="absolute h-full w-px bg-black" style={{left: `${boundaries.right - leftOffset}px`}} />
						</Fragment>
					))}
			</div>

			<div
				className="absolute w-full"
				style={{top: layerBoundaries[0], height: layerBoundaries[1] - layerBoundaries[0]}}
			>
				{storyMapState
					.flatMap((epic) => epic.features)
					.map((feature) => [feature.id, featureBoundaries[feature.id]] as const)
					.filter(([, boundaries]) => boundaries !== undefined)
					.map(([id, boundaries]) => [id, boundaries!] as const)
					.map(([id, boundaries]) => (
						<Fragment key={id}>
							<div className="absolute h-full w-px bg-black" style={{left: `${boundaries.left - leftOffset}px`}} />
							<div className="absolute h-full w-px bg-black" style={{left: `${boundaries.right - leftOffset}px`}} />
						</Fragment>
					))}
			</div>

			<div className="absolute w-full" style={{top: layerBoundaries[1]}}>
				{storyMapState
					.flatMap((epic) => epic.features)
					.map((feature) => [feature.id, featureBoundaries[feature.id], feature.stories] as const)
					.filter(([, boundaries]) => boundaries !== undefined)
					.map(([id, boundaries, stories]) => [id, boundaries!, stories] as const)
					.map(([id, featureBoundaries, stories]) => (
						<div
							key={id}
							className="absolute h-full"
							style={{
								left: `${featureBoundaries.left - leftOffset}px`,
								width: `${featureBoundaries.right - featureBoundaries.left}px`,
							}}
						>
							{stories
								.map((story) => [story.id, storyBoundaries[story.id]] as const)
								.filter(([, boundaries]) => boundaries !== undefined)
								.map(([id, boundaries]) => [id, boundaries!] as const)
								.map(([id, boundaries]) => (
									<Fragment key={id}>
										<div
											className="absolute h-px w-full bg-black"
											style={{top: `${boundaries.top - layerBoundaries[1] - 224}px`}}
										/>
										<div
											className="absolute h-px w-full bg-black"
											style={{top: `${boundaries.bottom - layerBoundaries[1] - 224}px`}}
										/>
									</Fragment>
								))}
						</div>
					))}
			</div>
		</div>
	)
}

export default DebugVisualizer
