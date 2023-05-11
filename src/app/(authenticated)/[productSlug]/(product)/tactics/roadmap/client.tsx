"use client"

import { Badge, Breadcrumb } from "antd"
import { collection } from "firebase/firestore"
import { useErrorHandler } from "react-error-boundary"
import { useCollection } from "react-firebase-hooks/firestore"

import type { FC } from "react"

import EpicsTab from "./EpicsTab"
import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import { StoryMapItemConverter } from "~/types/db/Products/StoryMapItems"


const RoadmapClientPage: FC = () => {
  const { product } = useAppContext()
  const [storyMapItems, , storyMapItemsError] = useCollection(
    collection(product.ref, `StoryMapItems`).withConverter(StoryMapItemConverter),
  )
  useErrorHandler(storyMapItemsError)

  if (!storyMapItems) return null

  return (
    <div className="flex flex-col gap-6 px-12 py-8 h-full">
      <div className="">
        <Breadcrumb className="capitalize mb-3" items={[{ title: `Operations` }, { title: `Roadmap` }]} />
        <h1 className="text-4xl font-semibold capitalize mb-1">What’s the batting order?</h1>
        <p className="text-textTertiary">Set realistic expectations for the order for when epics will be addressed.</p>
      </div>

      <div className="w-full h-full relative" style={{ overflow: `hidden`, backgroundColor: `` }}>
        <div className="flex roadmapCircle1 roadmapCircle">
          <div style={{ position: `absolute`, top: `50%`, right: 0 }}>
            <Badge.Ribbon text="Done" color="black">
            </Badge.Ribbon>
          </div>
        </div>
        <div className="roadmapCircle2 roadmapCircle">
          <div style={{ position: `absolute`, top: `50%`, right: 0 }}>
            <Badge.Ribbon text="Now" color="black">
            </Badge.Ribbon>
          </div>
        </div>
        <div className="roadmapCircle3 roadmapCircle" >
          <div style={{ position: `absolute`, top: `50%`, right: 0 }}>
            <Badge.Ribbon text="Next" color="black">
            </Badge.Ribbon>
          </div>
        </div>
        <div className="roadmapCircle4 roadmapCircle" >
          <div style={{ position: `absolute`, top: `50%`, right: 0 }}>
            <Badge.Ribbon text="Later" color="black">
            </Badge.Ribbon>
          </div>
        </div>
        <div className="roadmapCircle5 roadmapCircle" >
          <div style={{ position: `absolute`, top: `50%`, right: 0 }}>
            <Badge.Ribbon text="Future" color="black">
            </Badge.Ribbon>
          </div>
        </div>
      </div>

      {/* <div className="h-full">
        <EpicsTab storyMapItems={storyMapItems.docs.map((item) => item.data())} />
      </div>   */}
    </div>
  )
}

export default RoadmapClientPage