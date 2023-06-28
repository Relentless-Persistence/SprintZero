"use client"

import { RobotOutlined } from "@ant-design/icons"
import { Avatar, Breadcrumb, Button, Card, Divider, Skeleton, Spin, Tabs } from "antd"
import Meta from "antd/es/card/Meta"
import TextArea from "antd/es/input/TextArea"
import { collection } from "firebase/firestore"
import React, { type FC, useState } from "react"
import { useErrorHandler } from "react-error-boundary"
import { useCollection } from "react-firebase-hooks/firestore"

import type { ChatConversation, ChatRole } from "./types"

import { useAppContext } from "../../../AppContext"
import { MemberConverter } from "~/types/db/Products/Members"
import { trpc } from "~/utils/trpc"


const PracticeClientPage: FC = () => {

    const genAnswer = trpc.gptChat35.useMutation()
    const { product, user } = useAppContext()
    const [members, , membersError] = useCollection(collection(product.ref, `Members`).withConverter(MemberConverter))
    useErrorHandler(membersError)

    const loggedInMember = members?.docs.find(member => member.id === user.id);

    const [currentTab, setCurrentTab] = useState<(typeof tabs)[number][0]>(`civilEngineer`)
    const [question, setQuestion] = useState(``);
    const [answer, setAnswer] = useState(``);
    const [isLoading, setLoading] = useState(false);


    const [conversations, setConversations] = useState<ChatConversation>([]);

    const handleSendQuestion = async () => {
        if (question !== ``) {
            setLoading(true)


            // add question to conversations array first
            setConversations(prev => [...prev, { role: `user` as ChatRole, content: question }]);

            // Prepare the chat conversation for the OpenAI API
            const chatConversation = conversations.map(({ role, content }) => ({ role, content }));
            chatConversation.push({ role: `user` as ChatRole, content: question });

            const newAnswerRaw = await genAnswer.mutateAsync({
                chatConversation,
            })

            // const newAnswer = newAnswerRaw.response
            //     ?.split(`\n`)
            //     .map((s) => s.replace(/^[0-9]+\. */, ``))
            //     .filter((s) => s !== ``)[0]

            if (newAnswerRaw) {
                setLoading(false);
                const { response: newAnswer } = newAnswerRaw;
                if (newAnswer) {
                    setConversations(prev => [...prev, { role: `assistant` as ChatRole, content: newAnswer }]);
                    setQuestion(``)
                }
            }
        }
    }

    return (
        <div id="practice" className="grid h-full grid-cols-[1fr_auto]">
            <div className="flex flex-col relative h-full gap-4 overflow-hidden px-12 py-8">
                <Breadcrumb items={[{ title: `Userbase` }, { title: `Practice` }, { title: tabs.find(([key]) => key === currentTab)![1] },]} />
                <div className="leading-normal">
                    <h1 className="text-4xl font-semibold">We’re talkin’ bout practice...practice?</h1>
                    <p className="text-base text-textSecondary">
                        Improve your interview skills and get better at active listing + root cause anlysis
                    </p>
                </div>

                <Tabs
                    className="centered-tab"
                    tabPosition="top"
                    activeKey={currentTab}
                    onChange={(tab: (typeof tabs)[number][0]) => setCurrentTab(tab)}
                    items={tabs.map(([key, label]) => ({
                        key, label
                    }))}
                />

                <div className="flex gap-5 h-full">
                    <div className="w-5/12 flex-grow">
                        <span className="" style={{ color: `rgba(0, 0, 0, 0.45)`, fontWeight: 600, lineHeight: `24px` }}>Question</span>
                        <TextArea rows={12} className="mt-1 mb-4" value={question} onChange={(e) => setQuestion(e.target.value)}></TextArea>
                        <div>
                            <Button type="text" size="small">Clear</Button>
                            <Button size="small" onClick={handleSendQuestion}>Send</Button>
                        </div>
                    </div>
                    <div className="flex-grow-0 flex-shrink-0" style={{ width: `15px` }}>
                        <Divider className="" type="vertical" style={{ padding: `160px 0` }} />
                    </div>
                    <div className="w-5/12 flex flex-col gap-3 flex-grow max-h-[500px] overflow-y-auto space-y-1">
                        {conversations.map(({ role, content }, index) => (
                            <React.Fragment key={index}>
                                <Card className="w-full">
                                    <div className="flex items-center justify-between">
                                        <Meta
                                            avatar={role === `user` ? <Avatar shape="square" src={loggedInMember?.data().avatar} /> : <Button className="flex items-center justify-center" icon={<RobotOutlined />}></Button>}
                                            title={
                                                <div>
                                                    <span style={{ color: `rgba(0, 0, 0, 0.65)`, fontSize: `14px`, fontWeight: `normal` }}>{role === `user` ? `Question` : `Answer`}</span>
                                                </div>
                                            }
                                            description={isLoading && content === `` ? <Skeleton active /> : <span style={{ color: `#262626` }}>{content}</span>}
                                        />
                                    </div>
                                </Card>
                            </React.Fragment>
                        ))}
                    </div>

                </div>

                {/* {personas ? (
                    personas.docs.length === 0 ? (
                        <div className="grid grow place-items-center">
                            <Empty
                                style={{
                                    backgroundColor: `#ffffff`,
                                    boxShadow: `0px 6px 16px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12), 0px 9px 28px 8px rgba(0, 0, 0, 0.05)`,
                                    borderRadius: `6px`,
                                    padding: `16px 50px`
                                }}
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                imageStyle={{ height: 100, }}
                                description={
                                    <span
                                    // style={{ color: `rgba(0,0,0.45)` }}
                                    >
                                        Navigate to <LinkTo href={`/${product.id}/strategy/kickoff`} style={{ color: `#0958D9` }}>Strategy &gt; Kickoff</LinkTo> and add a persona to populate this section
                                    </span>
                                }
                            />
                        </div>
                    ) : (
                        <>Hello Content here</>
                    )
                ) : (
                    <Spin />
                )} */}

            </div>
        </div>
    )
}

export default PracticeClientPage

const tabs = [
    [`civilEngineer`, `Civil Engineer`],
    [`janitor`, `Janitor`],
    [`painter`, `Painter`],
    [`teachingAssistant`, `Teaching Assistant`],
    [`securityGuard`, `Security Guard`],
] as const