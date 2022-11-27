import {useQuery} from "@tanstack/react-query"

import type {ReactElement} from "react"

const StoryMap = (): ReactElement | null => {
	const {data: epics} = useQuery()
	return <div></div>
}

export default StoryMap
