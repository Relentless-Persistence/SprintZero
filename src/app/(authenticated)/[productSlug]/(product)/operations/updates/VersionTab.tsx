import { RobotOutlined } from "@ant-design/icons"
import { Button, Card, Input } from "antd"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { collection, doc, updateDoc } from "firebase/firestore"
import { useState } from "react"

import type { FC } from "react"

import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"

const { TextArea } = Input;

interface VersionTabProps {
  version: {
    name: string;
    deleted: boolean;
    updates: {
      changed: {
        description: string;
        updatedAt: string;
      };
      change: {
        description: string;
        updatedAt: string;
      };
      impact: {
        description: string;
        updatedAt: string;
      };
    };
    id: string;
  };
}

const VersionTab: FC<VersionTabProps> = ({ version }: VersionTabProps) => {
  dayjs.extend(relativeTime);

  const { product } = useAppContext()
  const [change, setChange] = useState(version.updates.change.description)
  const [changed, setChanged] = useState(version.updates.changed.description)
  const [impact, setImpact] = useState(version.updates.impact.description)

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

export default VersionTab;