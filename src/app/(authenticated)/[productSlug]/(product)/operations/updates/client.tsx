"use client"

import { Breadcrumb, Tabs } from "antd"
import { collection } from "firebase/firestore"
import { useState } from "react"
import { useErrorHandler } from "react-error-boundary"
import { useCollection } from "react-firebase-hooks/firestore"

import type { FC } from "react"

import VersionTab from "./VersionTab"
import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import { VersionConverter } from "~/types/db/Products/Versions"


const UpdatesClientPage: FC = () => {
  const { product } = useAppContext()
  const [currentTab, setCurrentTab] = useState(`1.0`)

  const [versions, , versionsError] = useCollection(collection(product.ref, `Versions`).withConverter(VersionConverter))
  useErrorHandler(versionsError)


  if (!versions) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6 px-12 py-8">
      <div className="">
        <Breadcrumb className="capitalize mb-3" items={[{ title: `Operations` }, { title: `Updates` }, { title: currentTab }]} />
        <h1 className="text-4xl font-semibold capitalize mb-1">Tell the people what you got going on</h1>
        <p className="text-textTertiary">No hot sauce required but if you’re a little spicy, that’s cool too.</p>
      </div>

      <Tabs
        activeKey={currentTab}
        onChange={(key) => setCurrentTab(key)}
        items={versions.docs.map(doc => (
          {
            label: doc.data().name,
            key: doc.data().name,
            children: (
              <VersionTab version={{ id: doc.id, ...doc.data() }} />
            )
          }
        ))}
      />

    </div>
  )
}

export default UpdatesClientPage