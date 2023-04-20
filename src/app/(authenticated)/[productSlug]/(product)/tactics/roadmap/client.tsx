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
    <div className="flex flex-col gap-6 px-12 py-8">
      <div className="">
        <Breadcrumb className="capitalize mb-3" items={[{ title: `Operations` }, { title: `Roadmap` }]} />
        <h1 className="text-4xl font-semibold capitalize mb-1">What’s the batting order?</h1>
        <p className="text-textTertiary">Set realistic expectations for the order for when epics will be addressed.</p>
      </div>

      <div className="w-full h-[500px] gradient-bg">
        <div className="flex">
          <div className="w-1/5 ml-5">
            <Badge.Ribbon text="Done" color="black">
              <div className="m-[-6px] ">
              </div>
            </Badge.Ribbon>
          </div>
          <div className="w-1/5 ml-3">
            <Badge.Ribbon text="Now" color="black">
              <div className="m-[-6px]">
              </div>
            </Badge.Ribbon>
          </div>
          <div className="w-1/5 ml-3">
            <Badge.Ribbon text="Next" color="black">
              <div className="m-[-6px]">
              </div>
            </Badge.Ribbon>
          </div>
          <div className="w-1/5 ml-3">
            <Badge.Ribbon text="Later" color="black">
              <div className="m-[-6px]">
              </div>
            </Badge.Ribbon>
          </div>
          <div className="w-1/5 ml-3">
            <Badge.Ribbon text="Future" color="black">
              <div className="m-[-6px]">
              </div>
            </Badge.Ribbon>
          </div>
        </div>

        <div className="h-full">
          <EpicsTab storyMapItems={storyMapItems.docs.map((item) => item.data())} />
        </div>
      </div>


    </div>
  )
}

export default RoadmapClientPage