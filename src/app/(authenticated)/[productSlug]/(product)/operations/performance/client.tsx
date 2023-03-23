"use client"

import { Breadcrumb, Select, Tabs } from "antd"
import { useState } from "react"

import type { FC } from "react"

import Burndown from "./Burndown"
import Flow from "./Flow"
import Velocity from "./Velocity"

const PerformanceClientPage: FC = () => {
  const [currentTab, setcurrentTab] = useState<`flow` | `burndown` | `velocity`>(`flow`)
  // const [data, setData] = useState([]);




  return (
    <div className="flex flex-col gap-6 px-12 py-8">
      <div className="">
        <Breadcrumb className="capitalize mb-3" items={[{ title: `Operations` }, { title: `Performance` }, { title: currentTab }]} />
        <h1 className="text-4xl font-semibold capitalize mb-1">Are we actually meeting Our Goals?</h1>
        <p className="text-textTertiary">The momentum of work items throughout the development cycle.</p>
      </div>

      <Tabs
        activeKey={currentTab}
        onChange={(key) => setcurrentTab(key as `flow` | `burndown` | `velocity`)}
        tabBarExtraContent={
          <Select
            defaultValue="sprint 1"
            style={{ width: 120 }}
            options={[
              { value: `sprint 1`, label: `Sprint 1` },
              { value: `sprint 2`, label: `Sprint 2` },
            ]}
          />
        }
        items={[
          {
            label: `Flow`,
            key: `flow`,
            children: (
              <div className="w-full h-[400px]">
                <Flow />
              </div>
            ),
          },
          {
            label: `Burndown`,
            key: `burndown`,
            children: (
              <div className="w-full h-[400px]">
                <Burndown />
              </div>
            ),
          },
          {
            label: `Velocity`,
            key: `velocity`,
            children: (
              <div className="w-full h-[400px]">
                <Velocity />
              </div>
            ),
          },
        ]}
      />

    </div>
  )
}

export default PerformanceClientPage