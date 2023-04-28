import { Card, Tag } from "antd"
import { collection, orderBy, query } from "firebase/firestore"
import { useState } from "react"
import { useErrorHandler } from "react-error-boundary"
import { useCollection } from "react-firebase-hooks/firestore"

import type { FC } from "react"
import type { StoryMapItem } from "~/types/db/Products/StoryMapItems"

import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import StoryDrawer from "~/components/StoryDrawer"
import { VersionConverter } from "~/types/db/Products/Versions"

interface AcceptanceCriteria {
  id: string;
  name: string;
  checked: boolean;
  status: string;
}

export type TaskColumnProps = {
  id: string
  title: string
  storyMapItems: StoryMapItem[]
  tasks: AcceptanceCriteria[]
  tab: string
}

const StoryTaskColumn: FC<TaskColumnProps> = ({ id, title, storyMapItems, tasks, tab }) => {
  const { product } = useAppContext()
  const [viewStory, setViewStory] = useState(false)
  const [storyId, setStoryId] = useState<string | undefined>(``)
  const [storyName, setStoryName] = useState<string | undefined>(``)
  const [FeatureName, setFeatureName] = useState<string | undefined>(``)
  const [epicName, setEpicName] = useState<string | undefined>(``)

  const [versions, , versionsError] = useCollection(
    query(collection(product.ref, `Versions`), orderBy(`name`, `asc`)).withConverter(VersionConverter),
  )
  useErrorHandler(versionsError)

  const openStoryDrawer = (data: AcceptanceCriteria): void => {

    const storyAcceptanceIndex = storyMapItems.findIndex(
      (obj) => obj.acceptanceCriteria.some((item) => item.id === data.id)
    );
    const storyBugIndex = storyMapItems.findIndex(
      (obj) => obj.bugs.some((item) => item.id === data.id)
    );

    const storyId = tab === `bugs` ? storyBugIndex : storyAcceptanceIndex
    const featureId = storyMapItems[storyId]?.parentId
    const epicId = storyMapItems[featureId]?.id

    setStoryId(storyMapItems[storyId]?.id)
    setStoryName(storyMapItems[storyId]?.name)

    // setFeatureName(storyMapItems[featureId]?.name)
    // console.log(`fname`, storyMapItems[featureId]?.name)

    // setEpicName(storyMapItems[epicId]?.name)
    // console.log(`epic`, storyMapItems[epicId]?.name)

    setViewStory(true)
  }

  return (
    <div>
      <Card title={title} className="h-[463px] lg-h-[600px]">
        <div className="flex flex-col gap-4">
          {tasks.length > 0 ? tasks
            .filter((task) => task.status === id)
            .map((task) => (
              <Card
                key={task.id}
                type="inner"
                title=<span className="cursor-pointer" onClick={() => openStoryDrawer(task)}>{task.name}</span>
              // extra={
              //   <Button size="small" onClick={() => {
              //     setSelectedTask(task)
              //     setEditTask(true)
              //   }}>
              //     Edit
              //   </Button>
              // }
              >
                <Tag>{storyName && storyName}</Tag>
              </Card>
            )) : null}
        </div>
      </Card>

      {storyId && versions && <StoryDrawer
        storyMapItems={storyMapItems}
        versions={versions}
        storyId={storyId}
        isOpen={viewStory}
        onClose={() => setViewStory(false)}
      />}
    </div>
  )
}

export default StoryTaskColumn
