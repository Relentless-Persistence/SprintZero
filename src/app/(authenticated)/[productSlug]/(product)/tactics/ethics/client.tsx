"use client"

import { DislikeOutlined, LikeOutlined } from "@ant-design/icons"
import { Breadcrumb, Segmented, Tabs } from "antd"
import { collection } from "firebase/firestore"
import { useState } from "react"
import { useErrorHandler } from "react-error-boundary"
import { useCollection } from "react-firebase-hooks/firestore"

import type { FC } from "react"
import type { Member } from "~/types/db/Products/Members";

import Story from "./Story"
import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import { MemberConverter } from "~/types/db/Products/Members"
import { StoryMapItemConverter } from "~/types/db/Products/StoryMapItems"
import { getStories } from "~/utils/storyMap"

const EthicsClientPage: FC = () => {
  const { product } = useAppContext()
  const [currentTab, setcurrentTab] = useState<`flagged` | `adjudicated`>(`flagged`)
  const [approved, setApproved] = useState<`accepted` | `rejected`>(`accepted`)
  const [storyMapItems, , storyMapItemsError] = useCollection(
    collection(product.ref, `StoryMapItems`).withConverter(StoryMapItemConverter),
  )
  useErrorHandler(storyMapItemsError)
  const stories = storyMapItems ? getStories(storyMapItems.docs.map((item) => item.data())) : []

  const [members, , membersError] = useCollection(collection(product.ref, `Members`).withConverter(MemberConverter))
  useErrorHandler(membersError)

  const membersData = members && members.docs.map(doc => ({ ...doc.data() }));

  const isApproved = approved === `accepted` ? true : false

  return (
    <div className="flex flex-col gap-6 px-12 py-8">
      <div className="">
        <Breadcrumb className="capitalize mb-3" items={[{ title: `Tactics` }, { title: `Ethics` }, { title: currentTab }]} />
        <h1 className="text-4xl font-semibold capitalize mb-1">Technically yes, but should we?</h1>
        <p className="text-textTertiary">Participate in reviewing and voting on user stories that have been flagged by our team members for potential ethical concerns.</p>
      </div>

      <Tabs
        activeKey={currentTab}
        onChange={(key) => setcurrentTab(key as `flagged` | `adjudicated`)}
        tabBarExtraContent={
          currentTab === `adjudicated` ? <Segmented options={[
            {
              label: `Accepted`,
              value: `accepted`,
              icon: <LikeOutlined />,
            },
            {
              label: `Rejected`,
              value: `rejected`,
              icon: <DislikeOutlined />,
            },
          ]}
            value={approved}
            onChange={value => setApproved(value as `accepted` | `rejected`)}
          /> : null
        }
        items={[
          {
            label: `Flagged`,
            key: `flagged`,
            children: (
              <div id="voiceTable" className="grid w-full grow grid-cols-2 gap-6">

                {storyMapItems &&
                  stories
                    .map((story) => (
                      <Story
                        key={story.id}
                        storyMapItems={storyMapItems.docs.map((item) => item.data())}
                        storyId={story.id}
                        members={membersData as Member[]}
                        tab={currentTab}
                      />
                    ))}
              </div>
            ),
          },
          {
            label: `Adjudicated`,
            key: `adjudicated`,
            children: (
              <div id="voiceTable" className="grid w-full grow grid-cols-2 gap-6">
                {storyMapItems &&
                  stories
                    .filter((story) => story.ethicsApproved === isApproved)
                    .map((story) => (
                      <Story
                        key={story.id}
                        storyMapItems={storyMapItems.docs.map((item) => item.data())}
                        storyId={story.id}
                        members={membersData as Member[]}
                        tab={currentTab}
                      />
                    ))}
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}

export default EthicsClientPage
