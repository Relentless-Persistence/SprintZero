import { Button } from "antd"

import type { FC } from "react"

import { useOnboardingContext } from "./OnboardingContext"

type PackageCardProps = {
    title: string
    price: string
    features: string[]
    selected: boolean
    onClick: () => void
}

const PackageCard: FC<PackageCardProps> = ({ title, price, features, selected, onClick }) => {
    return (
        <div className="my-24 flex items-center justify-center" style={{ height: `430px` }}>
            <div className={`mx-12 w-full ${selected ? `bg-green-500 border-green-700` : `border-gray-200 bg-white`}`}>
                <div className="flex flex-col items-center">
                    <h1 className="mb-2 text-2xl font-semibold">{title}</h1>
                    <ul className="mb-8 text-center">
                        {features.map((feature) => (
                            <li className="mb-2 text-base font-semibold" key={feature}>
                                - {feature}
                            </li>
                        ))}
                    </ul>
                    <div className="flex flex-col items-center">
                        <h2 className="mb-2">${price}</h2>
                        <span>Per Month</span>
                    </div>
                    <Button className="mt-8" onClick={onClick}>
                        {selected ? `Selected` : `Select`}
                    </Button>
                </div>
            </div>
        </div>
    )
}

const basicPackageFeatures = [
    `One Product Only`,
    `Three Users`,
    `$5.99 per each additional user month`,
    `$9.99 each additional product per month`,
]

const professionalPackageFeatures = [
    `Five Products`,
    `Twelve Users`,
    `$2.99 each additional user per month`,
    `$3.99 each additional product`,
    `Third-Party Integrations`,
]

const Tier: FC = () => {
    const { currentStep, setCurrentStep, tier, setTier } = useOnboardingContext()

    const handlePreviousButton = () => {
        console.log(`Cancel clicked`);
    }
    const handleNextButton = () => {
        setCurrentStep(currentStep + 1)
    }

    const handlePackageSelect = (packageName: "basic" | "professional") => {
        setTier(packageName)
    }

    return (
        <>
            <div className="flex justify-center">
                <div className="w-full px-12 md:mr-12 md:w-1/2 md:px-0">
                    <PackageCard
                        title="Basic"
                        price="9.99"
                        features={basicPackageFeatures}
                        selected={tier === `basic`}
                        onClick={() => handlePackageSelect(`basic`)}
                    />
                </div>
                <div className="w-full px-12 md:w-1/2 md:px-0">
                    <PackageCard
                        title="Professional"
                        price="29.99"
                        features={professionalPackageFeatures}
                        selected={tier === `professional`}
                        onClick={() => handlePackageSelect(`professional`)}
                    />
                </div>
            </div>
            <div className="flex justify-between">
                <Button htmlType='submit' className="bg-white" onClick={handlePreviousButton}>
                    Cancel
                </Button>
                <Button htmlType='submit' type="primary" onClick={handleNextButton}>
                    Next
                </Button>
            </div>
        </>
    )
}

export default Tier
