"use client"

import { Badge, Breadcrumb } from "antd"
import { collection, doc, updateDoc } from "firebase/firestore"
import { useEffect } from "react"
import { useErrorHandler } from "react-error-boundary"
import { useCollection } from "react-firebase-hooks/firestore"

import type { FC } from "react"
import type { StoryMapItem } from "~/types/db/Products/StoryMapItems";

import EpicsTab from "./EpicsTab"
import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import { StoryMapItemConverter } from "~/types/db/Products/StoryMapItems"
import { getEpics } from "~/utils/storyMap"

const initialData = {
  roadmap: {
    x: 0,
    y: 0
  }
}


const RoadmapClientPage: FC = () => {
  const { product } = useAppContext()
  const [storyMapItems, , storyMapItemsError] = useCollection(
    collection(product.ref, `StoryMapItems`).withConverter(StoryMapItemConverter),
  )
  useErrorHandler(storyMapItemsError)



  const storyMapDocs = storyMapItems?.docs.map((item) => item.data())

  const epics = storyMapDocs && getEpics(storyMapDocs)

  useEffect(() => {
    const checkData = () => {
      epics?.map(async (epic) => {
        if (`roadmap` in epic) return;

        const newEpic: StoryMapItem = { ...epic }
        const newData = { ...newEpic, ...initialData }

        const storyMapRef = collection(product.ref, `StoryMapItems`)

        await updateDoc(doc(storyMapRef, epic.id), newData)
      })
    }
    checkData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        </div>

        <div className="h-full">
          <EpicsTab storyMapItems={storyMapItems.docs.map((item) => item.data())} />
        </div>
      </div>


    </div>
  )
}

export default RoadmapClientPage