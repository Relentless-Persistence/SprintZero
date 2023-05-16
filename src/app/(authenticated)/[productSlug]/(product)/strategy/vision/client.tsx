"use client"

import { CloseCircleOutlined, RobotOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Input, Skeleton, Space, Steps, Tag, Timeline } from "antd";
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { diffArrays } from "diff"
import { Timestamp, collection, doc, writeBatch } from "firebase/firestore";
import { isEqual } from "lodash";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";
import { useErrorHandler } from "react-error-boundary"
import { useCollection } from "react-firebase-hooks/firestore"

import type { FC } from "react";
// import type { LogEntry } from "~/utils/logger";

import { useAppContext } from "../../../AppContext";
// import { FeatureConverter, FeatureSchema } from "~/types/db/Products/Features"
import { MemberConverter } from "~/types/db/Products/Members"
import { VisionUpdateConverter } from "~/types/db/Products/VisionUpdates"
import { db } from "~/utils/firebase";
// import { fetchLogs, logAction } from "~/utils/logger";
import { trpc } from "~/utils/trpc";

dayjs.extend(relativeTime)

const { TextArea } = Input;

const steps = [
  {
    title: `Value Proposition`
  },
  {
    title: `Proposed Features`
  },
  {
    title: `Statement`
  },
];

const VisionsClientPage: FC = () => {
  const { product, user } = useAppContext()
  // const [logs, setLogs] = useState<LogEntry[]>()
  const [current, setCurrent] = useState(0);
  const [statementEditMode, setStatementEditMode] = useState(false);

  const gpt = trpc.gpt.useMutation()

  const [features, setFeatures] = useState<string[]>([``, ``, ``, ``, ``]);
  //const [features, setFeatures] = useState<string[]>([`Feature 1`, `Feature 2`, `Feature 3`, `Feature 4`, `Feature 5`]);
  const [isSaveSuccessful, setIsSaveSuccessful] = useState(false);
  //console.log(features)

  const [valueProposition, setValueProposition] = useState(``);
  const [productVision, setProductVision] = useState<string | undefined>(undefined)
  const [generatingVision, setGeneratingVision] = useState(false)

  const [visionUpdates, , visionUpdatesError] = useCollection(
    collection(product.ref, `VisionUpdates`).withConverter(VisionUpdateConverter),
  )
  useErrorHandler(visionUpdatesError)

  const [members, , membersError] = useCollection(collection(product.ref, `Members`).withConverter(MemberConverter))
  useErrorHandler(membersError)

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const next = () => {
    if (current === 1) {
      //generateVisionStatement().then((statement) => setVisionStatement(statement));
    }
    setCurrent(current + 1);
  };

  const reset = () => {
    setCurrent(0);
    setProductVision(``);
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (product) {
      //setFeatures(product.data().features)
      //setValueProposition(product.data().valueProposition)
      //setProductVision(product.data().finalVision)
    }
  }, [product])

  // useEffect(() => {
  //   fetchLogs(product.ref, `VISION`).then(data => {
  //     setLogs(data)
  //   }).catch(error => {
  //     console.error(`Error fetching logs:`, error)
  //   });
  // });

  const onFeaturesNext = async () => {
    try {
      setGeneratingVision(true)
      next()
      const data = await gpt.mutateAsync({
        prompt: `Write a product vision for a ${listToSentence(product.data().productTypes)} app. Its goal is to: ${valueProposition}. The app has the following features: ${features.join(`,`)}.`,
      });
      setProductVision(data.response?.trim())
      setGeneratingVision(false)
    } catch (error) {
      console.error(error);
    }
  }

  const handleSubmit = async () => {
    const operations: string[] = []

    if (product.data().valueProposition !== valueProposition) {
      operations.push(`changed the value proposition to "${valueProposition}"`)
    }

    // Calculate feature diffs
    const featuresChanged = !isEqual(product.data().features, features)
    if (featuresChanged) {
      const differences = diffArrays(
        product.data().features,
        features.map((feature) => feature),
      )
      const removals = differences
        .filter((difference) => difference.removed)
        .flatMap((difference) => difference.value)
        .map((removal) => `"${removal}"`)
      const removalsText = removals.length > 0 ? `removed the feature${removals.length === 1 ? `` : `s`} ${listToSentence(removals)}` : undefined
      if (removalsText) operations.push(removalsText)
      const additions = differences
        .filter((difference) => difference.added)
        .flatMap((difference) => difference.value)
        .map((addition) => `"${addition}"`)
      const additionsText = additions.length > 0 ? `added the feature${additions.length === 1 ? `` : `s`} ${listToSentence(additions)}` : undefined
      if (additionsText) operations.push(additionsText)
    }


    const operationsText = listToSentence(operations).concat(`.`)


    const batch = writeBatch(db)
    if (product.data().finalVision === ``) {
      batch.set(
        doc(product.ref, `VisionUpdates`, nanoid()).withConverter(VisionUpdateConverter),
        {
          userId: user.id,
          text: `created the product vision.`,
          timestamp: Timestamp.now(),
        },
      )
    } else if (operations.length > 0) {
      batch.set(
        doc(product.ref, `VisionUpdates`, nanoid()).withConverter(VisionUpdateConverter),
        {
          userId: user.id,
          text: operationsText,
          timestamp: Timestamp.now(),
        },
      )
    }

    batch.update(product.ref, {
      finalVision: productVision,
      // productTypes: productTypes,
      valueProposition,
      features
    })
    await batch.commit()

    setStatementEditMode(false)
  }

  return (
    <div className="px-12 py-8">
      <div className="">
        <Breadcrumb className="capitalize mb-3" items={[{ title: `Strategy` }, { title: `Vision` }]} />
        <h1 className="text-4xl font-semibold capitalize mb-1">Vision statement</h1>
        <p className="text-textTertiary">A concise and inspiring statement that outlines the long-term goal and purpose of a product.</p>
      </div>

      <div className="flex items-start justify-between gap-10">
        <div className="w-4/6 mt-4">
          <Steps
            current={current}
            items={steps.map(item => ({
              key: item.title,
              title: item.title,
            }))}
          ></Steps>

          <div className="flex flex-col mt-8">
            {
              current === 0 && (
                <Card type="inner" title="What unique benefit are you offering to users?">
                  <div style={{ height: `220px`, overflow: `auto` }} className="pt-3 pb-3">
                    <TextArea rows={8} value={valueProposition} onChange={(e) => setValueProposition(e.target.value)} />
                  </div>
                </Card>
              )
            }

            {
              current === 1 && (
                <Card type="inner" title="Proposed Features">
                  <div style={{ height: `220px`, overflow: `auto` }}>
                    {features.map((feature, index) => (
                      <Input
                        key={index}
                        className="mb-3"
                        prefix={`${index + 1}.`}
                        suffix={<CloseCircleOutlined />}
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                      />
                    ))}
                  </div>
                </Card>
              )
            }

            {
              current === 2 && (
                <Card
                  type="inner"
                  title={
                    !statementEditMode ?
                      <Button size="small" className="flex items-center justify-center" color="#103001" style={{ color: `#103001`, border: `1px solid #103001` }} icon={<RobotOutlined style={{ color: `#103001` }} />}>ScrumGenie</Button> :
                      <Button type="text" danger onClick={() => setStatementEditMode(!statementEditMode)}>Cancel</Button>
                  }
                  extra=
                  {
                    statementEditMode ?
                      <Button type="text" onClick={() => setStatementEditMode(!statementEditMode)}>Done</Button> :
                      <Button type="text" onClick={() => {
                        setStatementEditMode(!statementEditMode)
                        setIsSaveSuccessful(false)
                      }}>Edit</Button>


                  }
                >
                  <div style={{ height: `220px`, overflow: `auto` }} className="pt-3 pb-3">
                    {
                      statementEditMode ? <TextArea rows={8} onChange={(e) => setProductVision(e.target.value)} value={productVision} />
                        :
                        <p style={{ fontWeight: 600, fontSize: 24, color: `rgba(0, 0, 0, 0.25)` }}>{generatingVision ? (
                          //<div style={{ position: `absolute`, top: `50%`, left: `50%`, transform: `translate(-50%, -50%)`, zIndex: 9999, width: `97%` }}>
                          <Skeleton active loading style={{ height: `50px` }} paragraph={{ rows: 5 }} />
                          //</div>
                        ) : productVision}</p>

                    }
                  </div>
                </Card>


              )
            }

            <div className="flex justify-end" style={{ marginTop: 26 }}>
              <Space wrap>
                {current === steps.length - 1 && (
                  <Button type="text" style={{ marginLeft: 8 }} onClick={reset}>
                    Reset
                  </Button>
                )}
                {(current > 0 && current < steps.length - 1) && (
                  <Button style={{ marginLeft: 8 }} onClick={() => setCurrent(current - 1)}>
                    Previous
                  </Button>
                )}
                {current === steps.length - 1 ? (
                  <Button
                    onClick={() => {
                      setIsSaveSuccessful(true);
                      handleSubmit().then(() => {
                      }).catch(() => {
                        setIsSaveSuccessful(false);
                        console.error
                      })
                    }}
                    disabled={isSaveSuccessful}
                  >
                    Save
                  </Button>
                ) : (
                  (current === 1) ?
                    <Button onClick={() => {
                      onFeaturesNext().catch(console.error)
                    }} disabled={!features[0] || features[0].length < 3}>
                      Next
                    </Button>
                    :
                    <Button onClick={next} disabled={valueProposition.length < 4}>
                      Next
                    </Button>
                )}
              </Space>
            </div>
          </div>
        </div>

        <div className="w-2/6 flex flex-col items-start gap-4">
          <Tag>Changelog</Tag>

          {visionUpdates?.docs.length === 0 ? (
            <p className="italic text-textTertiary">No changes yet</p>
          ) : (
            <Timeline
              items={
                visionUpdates?.docs
                  .sort((a, b) => b.data().timestamp.toMillis() - a.data().timestamp.toMillis())
                  .map((update) => ({
                    children: members && (
                      <div className="flex flex-col gap-1">
                        <p className="font-mono">{dayjs(update.data().timestamp.toDate()).fromNow()}</p>
                        <p className="text-xs">
                          <span className="text-info">
                            @{members.docs.find((member) => member.id === update.data().userId)?.data()?.name}
                          </span>
                          {` `}
                          {update
                            .data()
                            .text.split(`"`)
                            .map((text, i) =>
                              i % 2 === 0 ? (
                                <span key={i}>{text}</span>
                              ) : (
                                <b key={i} className="font-semibold">
                                  &quot;{text}&quot;
                                </b>
                              ),
                            )}
                        </p>
                      </div>
                    ),
                  }))
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default VisionsClientPage;

const listToSentence = (list: string[]) => {
  if (list.length === 0) return ``
  if (list.length === 1) return list[0]!
  const last = list.pop()!
  return `${list.join(`, `)}${list.length > 1 ? `,` : ``} and ${last}`
}