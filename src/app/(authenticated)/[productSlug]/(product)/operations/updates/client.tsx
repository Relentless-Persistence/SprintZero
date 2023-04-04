"use client"

import { RobotOutlined } from "@ant-design/icons"
import { Breadcrumb, Button, Card, Input, Tabs } from "antd"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { collection, doc, updateDoc } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useErrorHandler } from "react-error-boundary"
import { useCollection } from "react-firebase-hooks/firestore"

import type { FC } from "react"
import type { Version } from "~/types/db/Products/Versions";

import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import { VersionConverter } from "~/types/db/Products/Versions"

const { TextArea } = Input
dayjs.extend(relativeTime)


const UpdatesClientPage: FC = () => {
  const { product } = useAppContext()
  const [currentTab, setCurrentTab] = useState(`1.0`)
  const [change, setChange] = useState(``)
  const [changed, setChanged] = useState(``)
  const [impact, setImpact] = useState(``)

  const [versions, , versionsError] = useCollection(collection(product.ref, `Versions`).withConverter(VersionConverter))
  useErrorHandler(versionsError)



  const version = versions && versions.docs.map(doc => ({ id: doc.id, ...doc.data() })).find((item: Version) => item.name === currentTab);

  useEffect(() => {
    if (version) {
      setChange(version.updates.change.description)
      setChanged(version.updates.changed.description)
      setImpact(version.updates.impact.description)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versions])

  if (!version) {
    return <div>Loading...</div>;
  }

  const updateChange = async () => {
    const newVersion = { ...version }
    const newData = {
      ...newVersion, updates: {
        changed: {
          description: version.updates.changed.description,
          updatedAt: version.updates.changed.updatedAt,
        },
        change: {
          description: change,
          updatedAt: new Date().toISOString(),
        },
        impact: {
          description: version.updates.impact.description,
          updatedAt: version.updates.impact.updatedAt,
        },
      },
    }

    const versionRef = collection(product.ref, `Versions`)
    await updateDoc(doc(versionRef, version.id), newData)
  }

  const updateChanged = async () => {
    const newVersion = { ...version }
    const newData = {
      ...newVersion, updates: {
        change: {
          description: version.updates.change.description,
          updatedAt: version.updates.change.updatedAt,
        },
        changed: {
          description: changed,
          updatedAt: new Date().toISOString(),
        },
        impact: {
          description: version.updates.impact.description,
          updatedAt: version.updates.impact.updatedAt,
        },
      },
    }

    const versionRef = collection(product.ref, `Versions`)
    await updateDoc(doc(versionRef, version.id), newData)
  }

  const updateImpact = async () => {
    const newVersion = { ...version }
    const newData = {
      ...newVersion, updates: {
        change: {
          description: version.updates.change.description,
          updatedAt: version.updates.change.updatedAt,
        },
        impact: {
          description: impact,
          updatedAt: new Date().toISOString(),
        },
        changed: {
          description: version.updates.changed.description,
          updatedAt: version.updates.changed.updatedAt,
        },
      },
    }

    const versionRef = collection(product.ref, `Versions`)
    await updateDoc(doc(versionRef, version.id), newData)
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
        items={[
          {
            label: version.name,
            key: version.name,
            children: (
              <div className="grid grid-cols-3 gap-[18px] overflow-x-auto">
                <Card title={
                  <>
                    <h3>What Changed?</h3>
                    <p className="text-[12px] font-normal text-[#000]/[0.45]">Last modified {dayjs(version.updates.change.updatedAt).fromNow()}</p>
                  </>
                }
                  extra={<Button className="flex items-center justify-center" icon={<RobotOutlined />}></Button>}
                >
                  <div>
                    <p className="font-semibold text-[12px]">Description</p>
                    <TextArea rows={15} value={change} onChange={e => setChange(e.target.value)} />
                  </div>
                  <div className="mt-4 flex items-center justify-end space-x-4">
                    <Button type="link">Cancel</Button>
                    <Button type="primary" onClick={() => {
                      updateChange().catch(console.error)
                    }}>Save</Button>
                  </div>
                </Card>

                <Card title={
                  <>
                    <h3>Why did it change?</h3>
                    <p className="text-[12px] font-normal text-[#000]/[0.45]">Last modified {dayjs(version.updates.changed.updatedAt).fromNow()}</p>
                  </>
                }>
                  <div>
                    <p className="font-semibold text-[12px]">Description</p>
                    <TextArea rows={15} value={changed} onChange={e => setChanged(e.target.value)} />
                    <div className="mt-4 flex items-center justify-end space-x-4">
                      <Button type="link">Cancel</Button>
                      <Button type="primary" onClick={() => {
                        updateChanged().catch(console.error)
                      }}>Save</Button>
                    </div>
                  </div>
                </Card>

                <Card title={
                  <>
                    <h3>What’s the user impact?</h3>
                    <p className="text-[12px] font-normal text-[#000]/[0.45]">Last modified {dayjs(version.updates.changed.updatedAt).fromNow()}</p>
                  </>
                }>
                  <div>
                    <p className="font-semibold text-[12px]">Description</p>
                    <TextArea rows={15} value={impact} onChange={e => setImpact(e.target.value)} />
                  </div>
                  <div className="mt-4 flex items-center justify-end space-x-4">
                    <Button type="link">Cancel</Button>
                    <Button type="primary" onClick={() => {
                      updateImpact().catch(console.error)
                    }}>Save</Button>
                  </div>
                </Card>
              </div>
            )
          }
        ]}
      />

    </div>
  )
}

export default UpdatesClientPage