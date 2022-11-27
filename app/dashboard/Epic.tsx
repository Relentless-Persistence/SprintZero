import type {ReactElement} from "react"
import type {Epic as EpicType} from "~/types/db/Epics"

type Props = {
	epic: EpicType
}

const Epic = ({epic}: Props): ReactElement | null => {
	return <div>{epic.name}</div>
}

export default Epic
