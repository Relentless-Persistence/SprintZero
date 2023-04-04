"use client"

import { Breadcrumb, Tabs } from "antd"
import { useState } from "react"

import type { FC } from "react"

import ToneTab from "./Tone";
import VoiceTab from "./Voice";
import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"

const VoiceClientPage: FC = () => {
  const { product } = useAppContext()
  const [currentTab, setcurrentTab] = useState<`voice chart` | `tone spectrum`>(`voice chart`)

  const voiceData = product.data().voiceData

  return (
    <div className="flex flex-col gap-6 px-12 py-8">
      <div className="">
        <Breadcrumb className="capitalize mb-3" items={[{ title: `Operations` }, { title: `Performance` }, { title: currentTab }]} />
        <h1 className="text-4xl font-semibold capitalize mb-1">The pen is mightier than the sword</h1>
        <p className="text-textTertiary">A set of decision-making rules to ensure product copy aligns to the goals of the company.</p>
      </div>

      <Tabs
        activeKey={currentTab}
        onChange={(key) => setcurrentTab(key as `voice chart` | `tone spectrum`)}
        items={[
          {
            label: `Voice Chart`,
            key: `voice chart`,
            children: (
              <div id="voiceTable" className="w-full">
                <VoiceTab data={voiceData} />
              </div>
            ),
          },
          {
            label: `Tone Spectrum`,
            key: `tone spectrum`,
            children: (
              <div id="voiceTable" className="w-full">
                <ToneTab data={voiceData} />
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}

export default VoiceClientPage