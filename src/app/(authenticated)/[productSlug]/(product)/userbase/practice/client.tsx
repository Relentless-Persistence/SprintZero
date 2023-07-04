"use client"

import { RobotOutlined } from "@ant-design/icons"
import { Avatar, Breadcrumb, Button, Card, Divider, Skeleton, Spin, Tabs } from "antd"
import Meta from "antd/es/card/Meta"
import TextArea from "antd/es/input/TextArea"
import { collection } from "firebase/firestore"
import { ChatCompletionRequestMessage } from "openai"
import React, { type FC, useEffect, useRef, useState } from "react"
import { useErrorHandler } from "react-error-boundary"
import { useCollection } from "react-firebase-hooks/firestore"

import type { ChatConversation, ChatRole } from "./types"

import { useAppContext } from "../../../AppContext"
import { MemberConverter } from "~/types/db/Products/Members"
import { trpc } from "~/utils/trpc"
import ChatDownArrow from "~public/icons/practice-chat-down-arrow.svg"


const PracticeClientPage: FC = () => {

    const genAnswer = trpc.gptChat4.useMutation()
    const { product, user } = useAppContext()
    const [members, , membersError] = useCollection(collection(product.ref, `Members`).withConverter(MemberConverter))
    useErrorHandler(membersError)

    const loggedInMember = members?.docs.find(member => member.id === user.id);

    const [currentTab, setCurrentTab] = useState<(typeof tabs)[number][0]>(`civilEngineer`)
    const [question, setQuestion] = useState(``);
    const [answer, setAnswer] = useState(``);
    const [isLoading, setLoading] = useState(false);


    const questionRef = useRef<HTMLTextAreaElement | null>(null);
    const conversationsContainerRef = useRef<HTMLDivElement | null>(null);
    const lastAnswerRef = useRef<HTMLDivElement | null>(null);


    const [conversations, setConversations] = useState<ChatConversation>([]);

    const handleQuestionClear = () => {
        setQuestion(``);
        questionRef.current?.focus()
    };

    // useEffect(() => {
    //     const initialize
    //     setConversations(prev => [...prev, { role: `system` as ChatRole, content: `You are a ${tabs.find(([k]) => k === currentTab)[1]}; you only have 30 mins to be interviewed. You are being interviewed by a product team member who is working on a software application. If they are close-ended question, simeply reply "yes", or "no". If they as an open-ended question, expound on an answer. Every so often given an ambigious answer that requires the interviewer to ask "why". Start a timer after the first question. Every so often reminder the interviewer that you only have [number] of minutes left to speak with them; Once the 30 mins has elapsed, state that you have to leave and end the interview.` }]);
    // }, [currentTab])

    const initializeChat = () => {

        const systemMessage = {
            role: `system` as ChatRole, content: `You are a ${tabs.find(([k]) => k === currentTab)![1]}; you only have 2 minutes to be interviewed. You are the first of five people to be interviewed; Each interviewee has a distinct background, experience level, and personality. 

        you are being interviewed by a product team member who is working a software application.. 
        
        If they ask a close-ended question, simply reply "yes" or "no". 
        
        If they ask an open-ended question, expound on an answer.
        
        Every so often give an ambiguous answer that requires the interviewer to ask "why" 
        
        Start a timer after the first questions; Every so often remind the interviewer that you only have [number] of minutes left to speak with them;
        
        Once your time is up, please hand off to the next interviewee.  
        
        Once the 2 mins has elapsed, state that you have to leave and end the interview` }
        const welcomeMessage = {
            role: `assistant` as ChatRole,
            content: `Hi, How can I help you today?`,
        }
        setConversations([systemMessage, welcomeMessage])
    }

    useEffect(() => {

        // When no messages are present, we initialize the chat the system message and the welcome message
        // We hide the system message from the user in the UI
        if (!conversations.length) {
            initializeChat()
        }
    }, [conversations.length, setConversations])

    const handleSendQuestion = async () => {
        if (lastAnswerRef.current && conversationsContainerRef.current) {
            conversationsContainerRef.current.scrollTop = lastAnswerRef.current.offsetTop;
        }

        if (question !== ``) {
            setLoading(true)
            setQuestion(``)
            // add question to conversations array first
            setConversations(prev => [...prev, { role: `user` as ChatRole, content: question }]);
            const systemMessage = {
                role: `system` as ChatRole,
                content: `You are a Civil Engineer.`,
            }
            //setConversations(prev => [...prev, systemMessage]);


            // add empty answer to conversations array
            setConversations(prev => [...prev, { role: `assistant` as ChatRole, content: `` }]);

            // Prepare the chat conversation for the OpenAI API
            const chatConversation = conversations.map(({ role, content }) => ({ role, content }));
            chatConversation.push({ role: `user` as ChatRole, content: question });

            const newAnswerRaw = await genAnswer.mutateAsync({
                chatConversation,
            })

            if (newAnswerRaw) {
                setLoading(false);
                const { response: newAnswer } = newAnswerRaw;
                if (newAnswer) {
                    // Update the assistant's answer in conversations
                    setConversations(prev => {
                        const updatedConversations = [...prev];
                        updatedConversations[updatedConversations.length - 1]!.content = newAnswer;
                        return updatedConversations;
                    });
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
                        Improve your interview skills and get better at active listing + root cause analysis
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
                        <TextArea rows={12} className="mt-1 mb-4" value={question} onChange={(e) => setQuestion(e.target.value)} ref={questionRef}></TextArea>
                        <div className="flex justify-between">
                            <Button type="default"

                                onClick={() => {
                                    setConversations([]);
                                    initializeChat()
                                }}
                            >Start Over</Button>
                            <div>
                                <Button type="text" onClick={handleQuestionClear}>Clear</Button>
                                <Button type="primary" onClick={handleSendQuestion}>Send</Button>
                            </div>
                        </div>
                    </div>
                    <div className="flex-grow-0 flex-shrink-0" style={{ width: `15px` }}>
                        <Divider className="" type="vertical" style={{ padding: `160px 0` }} />
                    </div>
                    <div
                        ref={conversationsContainerRef}
                        className="w-5/12 flex flex-col gap-0 flex-grow max-h-[500px] overflow-y-auto space-y-1 pb-44">

                        {conversations.map(({ role, content }, index) => {

                            if (index in [0, 1]) return

                            return (

                                <React.Fragment key={index}>
                                    <Card
                                        ref={index === conversations.length - 1 ? lastAnswerRef : null}
                                        className="w-full" style={{
                                            margin: 0,
                                            marginBottom: index !== 0 && role === `assistant` ? `12px` : 0,
                                            border: role === `assistant` ? `1px solid #A7C983` : `1px solid rgba(0, 0, 0, 0.15)`
                                        }}>
                                        <div className="flex items-center justify-between">
                                            <Meta
                                                avatar={role === `user` ? <Avatar shape="square" src={loggedInMember?.data().avatar} /> : <Button

                                                    style={{
                                                        borderRadius: `6px`,
                                                        border: `1px solid #A7C983)`,
                                                        background: `#DDE3D5`
                                                    }}
                                                    className="flex items-center justify-center" icon={<RobotOutlined

                                                    />}></Button>}
                                                title={
                                                    <div>
                                                        <span style={{ color: `rgba(0, 0, 0, 0.65)`, fontSize: `14px`, fontWeight: `normal` }}>{role === `user` ? `Question` : `Answer`}</span>
                                                    </div>
                                                }
                                                description={isLoading && content === `` ? <div style={{ width: `410px` }}><Skeleton active style={{ height: `50px` }} title={false} paragraph={{ rows: 2 }} /></div> : <span style={{ color: `#262626` }}>{content}</span>}
                                            //description={<div style={{ width: `410px` }}><Skeleton active style={{ height: `50px` }} title={false} paragraph={{ rows: 2 }} /></div>}
                                            />
                                        </div>
                                    </Card>
                                    {role === `user` &&
                                        <div className="flex justify-center" style={{ "margin": 0, "padding": 0 }}>
                                            <ChatDownArrow />
                                        </div>
                                    }
                                </React.Fragment>

                            )
                        })}
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