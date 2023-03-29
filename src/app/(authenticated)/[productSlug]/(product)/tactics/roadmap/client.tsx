"use client"

import { Breadcrumb } from "antd"

import type { FC } from "react"


const VoiceClientPage: FC = () => {

  return (
    <div className="flex flex-col gap-6 px-12 py-8">
      <div className="">
        <Breadcrumb className="capitalize mb-3" items={[{ title: `Operations` }, { title: `Roadmap` }]} />
        <h1 className="text-4xl font-semibold capitalize mb-1">What’s the batting order?</h1>
        <p className="text-textTertiary">Set realistic expectations for the order for when epics will be addressed.</p>
      </div>

      <div className="w-full h-[500px] gradient-bg">
        map
      </div>
    </div>
  )
}

export default VoiceClientPage