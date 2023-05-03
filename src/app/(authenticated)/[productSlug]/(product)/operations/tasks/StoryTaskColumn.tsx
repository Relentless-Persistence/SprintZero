import { ArrowRightOutlined, CopyOutlined, FileTextOutlined, ReadOutlined } from "@ant-design/icons"
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

  const [versions, , versionsError] = useCollection(
    query(collection(product.ref, `Versions`), orderBy(`name`, `asc`)).withConverter(VersionConverter),
  )
  useErrorHandler(versionsError)

  return (
    <div>
      <Card title={title} className="w-[360px] h-[463px] lg-h-[600px] overflow-y-auto">
        <div className="flex flex-col gap-4">
          {tasks.length > 0 ? tasks
            .filter((task) => task.status === id)
            .map((task) => {
              const storyAcceptanceIndex = storyMapItems.findIndex(
                (obj) => obj.acceptanceCriteria.some((item) => item.id === task.id)
              );
              const storyBugIndex = storyMapItems.findIndex(
                (obj) => obj.bugs.some((item) => item.id === task.id)
              );
              const storyId = tab === `bugs` ? storyBugIndex : storyAcceptanceIndex;
              const selectedStory = storyMapItems[storyId];
              // const selectedStoryId = selectedStory?.id;
              const selectedStoryName = selectedStory?.name;
              // const openDrawer = () => {
              //   setStoryId(selectedStoryId)
              //   setViewStory(true)
              // };

              const selectedFeatureId: string = selectedStory?.parentId ?? ``;
              const feature = storyMapItems.find(story => story.id === selectedFeatureId);
              const featureName = feature?.name

              const epic = storyMapItems.find(story => story.id === feature?.parentId);
              const epicName = epic?.name


              return (
                <Card
                  key={task.id}
                  type="inner"
                  className=""
                  title=<span className="cursor-pointer">{task.name}</span>
                >
                  <div className="flex flex-wrap item-center gap-1">
                    <Tag icon={<ReadOutlined />}>{epicName}</Tag>
                    <ArrowRightOutlined />
                    <Tag icon={<CopyOutlined />}>{featureName}</Tag>
                    <ArrowRightOutlined />
                    <Tag icon={<FileTextOutlined />}>{selectedStoryName}</Tag>
                  </div>
                </Card>
              )
            }) : null}
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
