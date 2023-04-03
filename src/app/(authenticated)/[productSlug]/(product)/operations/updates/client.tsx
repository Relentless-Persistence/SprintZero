"use client"

import { Badge, Breadcrumb } from "antd"
import { collection, doc, updateDoc } from "firebase/firestore"
import { useState } from "react"
import { useErrorHandler } from "react-error-boundary"
import { useCollection } from "react-firebase-hooks/firestore"

import type { FC } from "react"
import type { StoryMapItem } from "~/types/db/Products/StoryMapItems";

import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import { StoryMapItemConverter } from "~/types/db/Products/StoryMapItems"
import { getEpics } from "~/utils/storyMap"


const RoadmapClientPage: FC = () => {
  const { product } = useAppContext()
  const [currentTab, setCurrentTab] = useState(`1.0`)
  const [storyMapItems, , storyMapItemsError] = useCollection(
    collection(product.ref, `StoryMapItems`).withConverter(StoryMapItemConverter),
  )
  useErrorHandler(storyMapItemsError)

  const storyMapDocs = storyMapItems?.docs.map((item) => item.data())

  const epics = storyMapDocs && getEpics(storyMapDocs)

  if (!storyMapItems) return null

  return (
    <div className="flex flex-col gap-6 px-12 py-8">
      <div className="">
        <Breadcrumb className="capitalize mb-3" items={[{ title: `Operations` }, { title: `Roadmap` }, { title: currentTab }]} />
        <h1 className="text-4xl font-semibold capitalize mb-1">Tell the people what you got going on</h1>
        <p className="text-textTertiary">No hot sauce required but if you’re a little spicy, that’s cool too.</p>
      </div>



    </div>
  )
}

export default RoadmapClientPage