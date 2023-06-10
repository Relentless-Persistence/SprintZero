"use client"

import { Avatar, Button, Form, Input, Segmented, Select, Space, Spin, Tag, notification } from "antd"
import { collection, doc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore"
import { nanoid } from "nanoid"
import { redirect, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useErrorHandler } from "react-error-boundary"
import { useAuthState } from "react-firebase-hooks/auth"
import { useCollection, useDocument } from "react-firebase-hooks/firestore"

import type { SelectProps } from 'antd';
import type { FC } from "react";

import LinkTo from "~/components/LinkTo"
import { BillingConverter } from "~/types/db/Billings"
import { UserConverter } from "~/types/db/Users"
import { auth, db } from "~/utils/firebase"
import { trpc } from "~/utils/trpc"

export const productTypeOptions: SelectProps['options'] = [
    { label: `Mobile`, value: `mobile` },
    { label: `Tablet`, value: `tablet` },
    { label: `Desktop`, value: `desktop` },
    { label: `Watch`, value: `watch` },
    { label: `Web`, value: `web` },
    { label: `Augmented Reality`, value: `augmentedReality` },
    { label: `Virtual Reality`, value: `virtualReality` },
    { label: `Artificial Intelligence`, value: `artificialIntelligence` },
    { label: `Humanoid`, value: `humanoid` },
    { label: `API`, value: `api` },
].sort((a, b) => a.label.localeCompare(b.label));

async function fetchSubscriptionIdAndEmail(sessionId: string) {
    const response = await fetch(`/api/billing/retrieveSubscriptionIdAndCustomerEmail?sessionId=${sessionId}`);
    //const data = await response.json() as { subscriptionId: string, customerEmail: string };
    const data = await response.json() as { subscriptionId?: string, customerEmail?: string, error?: string };

    if (!response.ok) {
        throw new Error(data.error || `An error occurred while fetching the subscription ID.`);
    }

    return { subscriptionId: data.subscriptionId, customerEmail: data.customerEmail };
}

const ConfigurationPageClientPage: FC = () => {
    const [loading, setLoading] = useState(true);

    const router = useRouter()


    const [user, , userError] = useAuthState(auth)

    useErrorHandler(userError)

    const searchParams = useSearchParams();

    const [billings, , billingsError] = useCollection(
        query(collection(db, `Billings`)).withConverter(BillingConverter),
    )
    useErrorHandler(billingsError)

    const session_id = searchParams?.get(`session_id`);

    useEffect(() => {
        const billingsRef = collection(db, `Billings`);
        if (session_id) {


            fetchSubscriptionIdAndEmail(session_id).then((result: { subscriptionId: string, customerEmail: string }) => {
                const { subscriptionId, customerEmail } = result;
                setDoc(doc(billingsRef, subscriptionId).withConverter(BillingConverter), {
                    billingOwner: user!.uid,
                    subscriptionId,
                    billingEmail: customerEmail
                })

                updateDoc(doc(db, `Users`, user!.uid).withConverter(UserConverter), {
                    hasAcceptedTos: true,
                })
                    .then(() => {
                        //router.push(`/configuration`);
                    })
                    .catch(error => {
                        console.error(`Error when handling billing:`, error);
                    });
                setLoading(false)
            }).catch(error => {
                notification.error({ message: `An error occurred while trying to validate your subscription.` })
                //console.log(error)
                router.push(`/`);
            });
        }
        else {
            const q = query(billingsRef, where(`billingOwner`, `==`, user?.uid)).withConverter(BillingConverter);
            getDocs(q)
                .then((querySnapshot) => {
                    if (querySnapshot.empty) {
                        // user is not a billing owner
                        router.push(`/`);
                    } else {
                        // user is a billig owner
                        setLoading(false)
                    }
                })
                .catch((error) => {
                    console.log(`Error when looking up for billing owner rights: `, error);
                });
        }
    }, [])

    const createProduct = trpc.product.create.useMutation()
    const inviteUser = trpc.product.inviteUser.useMutation()

    const [dbUser, , dbUserError] = useDocument(
        user ? doc(db, `Users`, user.uid).withConverter(UserConverter) : undefined,
    )
    useErrorHandler(dbUserError)

    const [sprintLength, setSprintLength] = useState<1 | 2 | 3>(1)
    const [sprintGate, setSprintGate] = useState<1 | 2 | 3 | 4 | 5>(1)
    const [hasSubmitted, setHasSubmitted] = useState(false)

    const updateSprintLength = (sprintLenStr: string) => {
        if (sprintLenStr === `One Week`) setSprintLength(1)
        else if (sprintLenStr === `Two Weeks`) setSprintLength(2)
        else if (sprintLenStr === `Three Weeks`) setSprintLength(3)
    }

    const updateSprintGate = (sprintGateStr: string) => {
        if (sprintGateStr === `Monday`) setSprintGate(1)
        else if (sprintGateStr === `Tuesday`) setSprintGate(2)
        else if (sprintGateStr === `Wednesday`) setSprintGate(3)
        else if (sprintGateStr === `Thursday`) setSprintGate(4)
        else if (sprintGateStr === `Friday`) setSprintGate(5)
    }

    /* eslint-disable no-template-curly-in-string */
    const validateMessages = {
        required: `\${label} is required!`,
        types: {
            email: `Please enter a valid email`,
        },
    };



    const onFinish = async (values: { productName: string, productType: string[], members: { email1: string | null, email2?: string | null, email3?: string | null } }) => {
        if (hasSubmitted || !dbUser?.exists() || !user) return
        setHasSubmitted(true)

        const { productId } = await createProduct.mutateAsync({
            cadence: sprintLength,
            effortCost: null,
            effortCostCurrencySymbol: null,
            name: values.productName,
            productTypes: values.productType,
            sprintStartDayOfWeek: sprintGate,
            userIdToken: await user.getIdToken(true),
            userAvatar: user.photoURL,
            userName: user.displayName ?? user.email ?? `Unknown User`,
        })

        let { email1, email2, email3 } = values.members
        if (email1 === email2) email2 = null
        if (email1 === email3) email3 = null
        if (email2 === email3) email3 = null

        for (const recipient of [email1, email2, email3]) {
            if (!recipient) continue
            await inviteUser.mutateAsync({
                email: recipient,
                productId,
                userIdToken: await user.getIdToken(),
                userType: `editor`,
            })
        }

        router.push(`/${productId}/map`)
    };

    if (loading) {
        return (
            <div className="grid h-full place-items-center">
                {/* <p className="text-xl">Redirecting you to your dashboard...</p> */}
                <Spin size="large" tip="bleeps, sweeps, and creeps..." />
            </div>
        )
    }
    else
        return (
            <Form
                name="product-configuration"
                onFinish={onFinish}
                validateMessages={validateMessages}
            >

                <div className="">
                    <div className="flex w-full mb-8">
                        <div className="leading-normal">
                            <h1 className="text-4xl font-semibold">Let’s get this party started!</h1>
                            <p className="text-base text-textSecondary">
                                Please provide your information below so we can keep our internet overlords happy
                            </p>
                        </div>
                        <div className="flex items-center flex-end gap-4">
                            <div className="flex min-w-0 flex-1 flex-col items-end gap-1">
                                <div className="flex w-full flex-1 items-center gap-3">
                                    <div className="min-w-0 flex-1 text-end leading-normal">
                                        <p className="font-semibold">{user?.displayName}</p>
                                        <p className="truncate text-sm text-textTertiary">{user?.email}</p>
                                    </div>
                                    <Avatar
                                        src={user?.photoURL}
                                        size={48}
                                        alt="Avatar"
                                        className="shrink-0 basis-auto border border-primary"
                                    />
                                </div>
                                <LinkTo href="/sign-out" className="text-sm text-info">
                                    Log out
                                </LinkTo>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 mb-7">
                        <div className="w-1/2">
                            <div className="leading-normal mb-2">
                                <p className="text-lg font-medium">Product name</p>
                                <p className="text-base text-xs text-textSecondary">What are we gonna call this thing?</p>
                            </div>
                            <Form.Item
                                name="productName"
                                rules={[{ required: true, message: `Please input a product name` }]}
                            >
                                <Input placeholder="eg. Netflix, Headspace, Spotify" size="large" />
                            </Form.Item>

                        </div>
                        <div className="w-1/2">
                            <div className="leading-normal mb-2">
                                <p className="text-lg font-medium">Product type</p>
                                <p className="text-base text-xs text-textSecondary">How will users typically access your product?</p>
                            </div>
                            <Form.Item
                                name="productType"
                                rules={[{ required: true, message: `Please select a product type` }]}
                            >
                                <Select
                                    mode="multiple"
                                    allowClear
                                    style={{ width: `100%` }}
                                    placeholder="eg. Tablet, Mobile, Web"
                                    //defaultValue={['mobile', 'web']}
                                    //onChange={handleChange}
                                    options={productTypeOptions}
                                    size="large"
                                />
                            </Form.Item>
                        </div>
                    </div>
                    <div className="flex">
                        <div className="leading-normal mb-2">
                            <p className="text-lg font-medium">Team members <Tag>Optional</Tag></p>
                            <p className="text-base text-xs text-textSecondary">Who’s gonna saddle up with you?</p>
                        </div>
                    </div>
                    <div className="flex gap-4 mb-7">
                        <div className="w-1/3">
                            <Form.Item name={[`members`, `email1`]} rules={[{ type: `email` }]}>
                                <Input addonBefore="Email" placeholder="username@domain.com" size="large" />
                            </Form.Item>
                        </div>
                        <div className="w-1/3">
                            <Form.Item name={[`members`, `email2`]} rules={[{ type: `email` }]}>
                                <Input addonBefore="Email" placeholder="username@domain.com" size="large" />
                            </Form.Item>
                        </div>
                        <div className="w-1/3">
                            <Form.Item name={[`members`, `email3`]} rules={[{ type: `email` }]}>
                                <Input addonBefore="Email" placeholder="username@domain.com" size="large" />
                            </Form.Item>
                        </div>
                    </div>
                    <div className="flex">
                        <div className="leading-normal mb-2">
                            <p className="text-lg font-medium">Sprint length</p>
                            <p className="text-base text-xs text-textSecondary">How many weeks does it take?</p>
                        </div>
                    </div>
                    <div className="flex mb-7">
                        <Form.Item
                            name="sprintLength"
                            className="flex-grow"
                        >
                            <Segmented name="sprintLength" defaultValue="One Week" size="large" block options={[`One Week`, `Two Weeks`, `Three Weeks`]} value={sprintLength} onChange={updateSprintLength} style={{ background: `#EBEBEB` }} />
                        </Form.Item>
                    </div>
                    <div className="flex">
                        <div className="leading-normal mb-2">
                            <p className="text-lg font-medium">Gate</p>
                            <p className="text-base text-xs text-textSecondary">What day do you start one?</p>
                        </div>
                    </div>
                    <div className="flex gap-4 mb-7">
                        <Form.Item
                            name="sprintGate"
                            className="flex-grow"
                        >
                            <Segmented name="sprintGate" defaultValue="Monday" size="large" block options={[`Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`]} value={sprintGate} onChange={updateSprintGate} style={{ background: `#EBEBEB` }} />
                        </Form.Item>
                    </div>
                    <div className="flex justify-end">
                        <Button type="primary" htmlType="submit" loading={hasSubmitted}>
                            Start
                        </Button>
                    </div>
                </div>
            </Form>
        )
}

export default ConfigurationPageClientPage