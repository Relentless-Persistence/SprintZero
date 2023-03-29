"use client"

import { Breadcrumb, Tabs } from "antd"
import { doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react"

import type { FC } from "react"

import ToneTab from "./Tone";
import VoiceTab from "./Voice";
import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import { db } from "~/utils/firebase"

const initialData = {
  voiceData: {
    voice: {
      columns: [
        {
          title: `Theme A`,
          dataIndex: `col1`,
          key: `col1`,
          editable: true,
        },
        {
          title: `Theme B`,
          dataIndex: `col2`,
          key: `col2`,
          editable: true,
        },
        {
          title: `Theme C`,
          dataIndex: `col3`,
          key: `col3`,
          editable: true,
        },
      ],
      rows: [
        {
          key: ``,
          col1: `Theme A`,
          col2: `Theme B`,
          col3: `Theme C`,
        },
        {
          key: `Concepts`,
          col1: ``,
          col2: ``,
          col3: ``,
        },
        {
          key: `Vocabulary`,
          col1: ``,
          col2: ``,
          col3: ``,
        },
        {
          key: `Verbosity`,
          col1: ``,
          col2: ``,
          col3: ``,
        },
        {
          key: `Grammar`,
          col1: ``,
          col2: ``,
          col3: ``,
        },
        {
          key: `Punctuation`,
          col1: ``,
          col2: ``,
          col3: ``,
        },
        {
          key: `Casing`,
          col1: ``,
          col2: ``,
          col3: ``,
        },
      ],
    },

    tone: {
      columns: [
        {
          title: `Theme A`,
          dataIndex: `col1`,
          key: `col1`,
          editable: true,
        },
        {
          title: `Theme B`,
          dataIndex: `col2`,
          key: `col2`,
          editable: true,
        },
        {
          title: `Theme C`,
          dataIndex: `col3`,
          key: `col3`,
          editable: true,
        },
      ],
      rows: [
        {
          key: ``,
          col1: `Theme A`,
          col2: `Theme B`,
          col3: `Theme C`,
        },
        {
          key: `Concepts`,
          col1: ``,
          col2: ``,
          col3: ``,
        },
        {
          key: `Use Cases`,
          col1: ``,
          col2: ``,
          col3: ``,
        },
        {
          key: `Desired Effect`,
          col1: ``,
          col2: ``,
          col3: ``,
        },
      ],
    },
  }
}


const VoiceClientPage: FC = () => {
  const { product } = useAppContext()
  const [currentTab, setcurrentTab] = useState<`voice chart` | `tone spectrum`>(`voice chart`)

  const voiceData = product.data().voiceData || null

  useEffect(() => {
    if (voiceData) return;

    const fetchData = async () => {
      const newProduct = { ...product.data() };
      const newData = { ...newProduct, ...initialData };

      await updateDoc(doc(db, `Products`, product.id), newData);
    };

    fetchData().catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


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
                {voiceData && <VoiceTab data={voiceData} />}
              </div>
            ),
          },
          {
            label: `Tone Spectrum`,
            key: `tone spectrum`,
            children: (
              <div id="voiceTable" className="w-full">
                {voiceData && <ToneTab data={voiceData} />}
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}

export default VoiceClientPage