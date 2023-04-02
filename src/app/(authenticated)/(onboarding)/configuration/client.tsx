"use client"

import { Button, Input, Tag } from "antd"
import type { FC } from "react"
import MultipleSelection from "~/components/MultipleSelection"

const ConfigurationPageClientPage: FC = () => {
    return (
        <div className="">
            <div className="flex flex-col gap-6 w-full mb-8">
                <div className="leading-normal">
                    <h1 className="text-4xl font-semibold">Let’s get this party started!</h1>
                    <p className="text-base text-textSecondary">
                        Please provide your information below so we can keep our internet overlords happy
                    </p>
                </div>
            </div>
            <div className="flex gap-4 mb-7">
                <div className="w-1/2">
                    <div className="leading-normal mb-2">
                        <p className="text-lg font-medium">Product name</p>
                        <p className="text-base text-xs text-textSecondary">What are we gonna call this thing?</p>
                    </div>
                    <Input placeholder="eg. Netflix, Headspace, Spotify" />
                </div>
                <div className="w-1/2">
                    <div className="leading-normal mb-2">
                        <p className="text-lg font-medium">Product type</p>
                        <p className="text-base text-xs text-textSecondary">How will users typically access your product?</p>
                    </div>
                    <MultipleSelection />
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
                    <Input addonBefore="Email" placeholder="username@domain.com" />
                </div>
                <div className="w-1/3">
                    <Input addonBefore="Email" placeholder="username@domain.com" />
                </div>
                <div className="w-1/3">
                    <Input addonBefore="Email" placeholder="username@domain.com" />

                </div>
            </div>
            <div className="flex">
                <div className="leading-normal mb-2">
                    <p className="text-lg font-medium">Sprint length</p>
                    <p className="text-base text-xs text-textSecondary">How many weeks does it take?</p>
                </div>
            </div>
            <div className="flex gap-4 mb-7">
                <div className="w-1/3">
                    <Button className="w-full" disabled={false}>
                        One week
                    </Button>
                </div>
                <div className="w-1/3">
                    <Button className="w-full" disabled={false}>
                        One week
                    </Button>
                </div>
                <div className="w-1/3">
                    <Button className="w-full" disabled={false}>
                        One week
                    </Button>

                </div>
            </div>
            <div className="flex">
                <div className="leading-normal mb-2">
                    <p className="text-lg font-medium">Gate</p>
                    <p className="text-base text-xs text-textSecondary">What day do you start one?</p>
                </div>
            </div>
            <div className="flex gap-4 mb-7">
                <div className="w-1/5">
                    <Button className="w-full" disabled={false}>
                        Monday
                    </Button>
                </div>
                <div className="w-1/5">
                    <Button className="w-full" disabled={false}>
                        Tuesday
                    </Button>
                </div>
                <div className="w-1/5">
                    <Button className="w-full" disabled={false}>
                        Wednesday
                    </Button>
                </div>
                <div className="w-1/5">
                    <Button className="w-full" disabled={false}>
                        Thursday
                    </Button>
                </div>
                <div className="w-1/5">
                    <Button className="w-full" disabled={false}>
                        Friday
                    </Button>
                </div>
            </div>
            <div className="flex justify-end">
                <Button type="primary">
                    Start
                </Button>
            </div>
        </div>
    )
}

export default ConfigurationPageClientPage

// import { CloseCircleOutlined, LoadingOutlined } from "@ant-design/icons";
// import { Button, Divider, Form, Steps } from "antd"
// import { useEffect, useState } from "react"
// import type { FC } from "react";

// import Configuration from "./Configuration"
// import CustomStepsActions from "./CustomStepsActions"
// import Finalize from "./Finalize"
// import Information from "./Information"
// import { OnboardingContext } from "./OnboardingContext";
// import Payment from "./Payment"
// import Tier from "./Tier"
// import CheckoutForm from "./CheckoutForm";
// import Billing from "./Billing";

// interface StepData {
//     title: string
//     description: string,
//     status?: "process" | "wait" | "finish" | "error" | undefined,
//     icon?: JSX.Element | undefined,
// }

// const steps: StepData[] = [
//     {
//         title: `Tier`,
//         description: `How many you got?`,
//         status: undefined,
//         icon: undefined
//     },
//     {
//         title: `Information`,
//         description: `Got those digits?`,
//         status: undefined,
//         icon: undefined
//     },
//     {
//         title: `Payment`,
//         description: `C.R.E.A.M`,
//         status: undefined,
//         icon: undefined
//     },
//     {
//         title: `Finalize`,
//         description: `Wrap it up B`,
//         status: undefined,
//         icon: undefined
//     },
//     {
//         title: `Configuration`,
//         description: `How you like it?`,
//         status: undefined,
//         icon: undefined
//     },
// ]

// const ConfigurationPageClientPage: FC = () => {

//     const [clientSecret, setClientSecret] = useState("");


//     useEffect(() => {
//            Create PaymentIntent as soon as the page loads
//         fetch("/api/payment_intents", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ items: [{ id: "xl-tshirt" }] }),
//         })
//             .then((res) => res.json())
//             .then((data) => setClientSecret(data.clientSecret));
//     }, []);

//     const appearance = {
//         theme: 'stripe',
//     };
//     const options = {
//         clientSecret,
//         appearance,
//     };

//     const [formData, setFormData] = useState({
//         name: ``,
//         email: ``,
//     });



//       Onboarding context
//     const [tier, setTier] = useState(undefined);
//     const [billingInfo, setBillingInfo] = useState(undefined);
//     const [paymentInfo, setPaymentInfo] = useState(undefined);

//     const [currentStep, setCurrentStep] = useState<number>(0)
//     const [paymentStatus, setPaymentStatus] = useState(`pending`);
//     const [stepItems, setStepItems] = useState<StepData[]>(steps);



//     const handleFormSubmit = (values: FormData) => {
//         console.log(`hello `, values)
//         setFormData({ ...values, [`step${currentStep + 1}`]: values });
//     };



//     const handlePaymentStatus = (status: "process" | "wait" | "finish" | "error" | undefined) => {
//         console.log(`Payment status: ${status}`)
//         const newSteps = [...steps];

//         let statusIcon = undefined
//         if (status === `process`)
//             statusIcon = <LoadingOutlined />;
//         else if (status === `error`)
//             statusIcon = <CloseCircleOutlined />

//         newSteps[3] = {
//             ...newSteps[3],
//             status,
//             icon: undefined,
//         };
//         setStepItems(newSteps);
//     };

//     const stepsContent = [
//         <Tier key="tier-step" />,
//         <Information key="information-step" />,
//         <Payment key="payment-step" />,
//         <Finalize key="finalize-step" />,
//         <Configuration key="configuration-step" />,
//     ]

//     interface FormData {
//         name: string;
//         email: string;
//     }

//     return (
//          <OnboardingContext.Provider
//              value={{
//                  currentStep,
//                  setCurrentStep,
//                  tier,
//                  setTier,
//                  billingInfo,
//                  setBillingInfo,
//                  paymentInfo,
//                  setPaymentInfo,
//              }}
//          >
//              <div className="flex flex-col gap-6 w-full">
//                  <div className="leading-normal">
//                      <h1 className="text-5xl font-semibold">Sorry...but we gotta keep the lights on</h1>
//                      <p className="text-lg text-textSecondary">
//                          Please provide your information below so we can keep our internet overlords happy
//                      </p>
//                  </div>

//                  <Steps size="small" current={currentStep} items={stepItems} />
//                  {stepsContent[currentStep]}

//              </div>
//          </OnboardingContext.Provider>


//           <div className="flex justify-center" style={{ width: "400px" }}>
//               {clientSecret && (
//                   <Elements options={options} stripe={stripePromise}>
//                       <CheckoutForm />
//                   </Elements>
//               )}
//           </div>

//           <OnboardingContext.Provider
//               value={{
//                   currentStep,
//                   setCurrentStep,
//                   tier,
//                   setTier,
//                   billingInfo,
//                   setContactInfo,
//                   paymentInformation,
//                   setPaymentInfo,
//               }}
//           >
//               <div className="flex flex-col gap-6 w-full">
//                   <div className="leading-normal">
//                       <h1 className="text-5xl font-semibold">Sorry...but we gotta keep the lights on</h1>
//                       <p className="text-lg text-textSecondary">
//                           Please provide your information below so we can keep our internet overlords happy
//                       </p>
//                   </div>
//                   <Steps size="small" current={currentStep} items={stepItems} />
//                   {stepsContent[currentStep]}
//                   {/* <CustomStepsActions
//                           currentStep={currentStep}
//                           totalSteps={5}
//                           onPrevious={handlePrevious}
//                           onNext={handleNext}
//                           items={stepItems}
//                           onPaymentStatus={handlePaymentStatus}
//                           formData={formData}
//                       /> */}
//               </div>
//           </OnboardingContext.Provider>
//     )
// }

// export default ConfigurationPageClientPage
