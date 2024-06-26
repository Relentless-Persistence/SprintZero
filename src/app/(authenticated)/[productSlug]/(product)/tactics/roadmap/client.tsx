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

      <div className="relative w-full h-full ">
        <div className="w-full h-full relative" style={{
          overflow: `hidden`, backgroundColor: ``, zIndex: 1,
          border: `3px solid rgb(210, 215, 206)`,
        }}>
          <div className="flex roadmapCircle1 roadmapCircle" style={{

          }}>
            <div style={{ position: `absolute`, top: `50%`, right: 0 }}>
              <Badge.Ribbon text="Done" color="black">
              </Badge.Ribbon>
            </div>
          </div>
          <div className="roadmapCircle2 roadmapCircle" style={{
          }}>
            <div style={{ position: `absolute`, top: `50%`, right: 0 }}>
              <Badge.Ribbon text="Now" color="black">
              </Badge.Ribbon>
            </div>
          </div>
          <div className="roadmapCircle3 roadmapCircle" style={{
          }}>
            <div style={{ position: `absolute`, top: `50%`, right: 0 }}>
              <Badge.Ribbon text="Next" color="black">
              </Badge.Ribbon>
            </div>
          </div>
          <div className="roadmapCircle4 roadmapCircle" style={{
          }}>
            <div style={{ position: `absolute`, top: `50%`, right: 0 }}>
              <Badge.Ribbon text="Later" color="black">
              </Badge.Ribbon>
            </div>
          </div>
          <div className="roadmapCircle5 roadmapCircle" style={{
          }}>
          </div>
          <div className="h-full w-full absolute top-0 left-0 mr-100" style={{ zIndex: 10 }}>
            <EpicsTab storyMapItems={storyMapItems.docs.map((item) => item.data())} />
          </div>
        </div>
        <div style={{ position: `absolute`, top: `50%`, right: 0, zIndex: 15 }}>
          <Badge.Ribbon text="Future" color="black">
          </Badge.Ribbon>
        </div>

      </div>
    </div>
  )
}

export default RoadmapClientPage