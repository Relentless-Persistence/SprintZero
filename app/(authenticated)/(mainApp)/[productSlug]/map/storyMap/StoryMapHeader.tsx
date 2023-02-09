import {LeftOutlined, RightOutlined} from "@ant-design/icons"
import {Breadcrumb, Button} from "antd"
import {collection} from "firebase/firestore"
import {useCollectionData} from "react-firebase-hooks/firestore"

import type {Dispatch, FC, SetStateAction} from "react"
import type {Id} from "~/types"

import {VersionConverter, Versions} from "~/types/db/Versions"
import {db} from "~/utils/firebase"

export type StoryMapHeaderProps = {
	currentVersionId: Id | `__ALL_VERSIONS__`
	setNewVersionInputValue: Dispatch<SetStateAction<string>>
}

const StoryMapHeader: FC<StoryMapHeaderProps> = ({currentVersionId, setNewVersionInputValue}) => {
	const [versions] = useCollectionData(collection(db, Versions._).withConverter(VersionConverter))

	return (
		<div className="flex flex-col gap-8">
			<div className="flex justify-between px-12 pt-8">
				<Breadcrumb>
					<Breadcrumb.Item>Story Map</Breadcrumb.Item>
					<Breadcrumb.Item>{versions?.find((version) => version.id === currentVersionId)?.name}</Breadcrumb.Item>
				</Breadcrumb>

				<Button onClick={() => setNewVersionInputValue(``)} className="bg-white">
					+ Add version
				</Button>
			</div>
			<div className="px-12 text-laurel">
				<div className="relative text-[0.6rem]">
					<LeftOutlined className="absolute left-[-6px] -translate-y-1/2" />
					<div className="absolute top-1/2 h-0 w-full -translate-y-1/2 border-t-[1px] border-dashed border-laurel" />
					<RightOutlined className="absolute right-[-6px] -translate-y-1/2" />
				</div>
				<div className="mt-2 flex justify-between text-xs">
					<p>High value</p>
					<p>Low value</p>
				</div>
			</div>
		</div>
	)
}

export default StoryMapHeader
