import { PlusOutlined } from "@ant-design/icons";
import { Button, Card } from "antd";
import { useState } from "react"

import type { FC } from "react";

type PackageCardProps = {
    title: string;
    price: string;
    features: string[];
    selected: boolean;
    onClick: () => void;
};

const PackageCard: FC<PackageCardProps> = ({ title, price, features, selected, onClick }) => {
    return (
        <div className="flex justify-center items-center my-24" style={{ height: `430px` }}>

            <div
                className={`w-full mx-12 ${selected ? `bg-green-500 border-green-700` : `bg-white border-gray-200`
                    }`}
            >
                <div className="flex flex-col items-center">
                    <h1 className="text-2xl font-semibold mb-2">{title}</h1>
                    <ul className="text-center mb-8">
                        {features.map((feature) => (
                            <li className="font-semibold text-base mb-2" key={feature}>
                                - {feature}
                            </li>
                        ))}
                    </ul>
                    <div className="flex flex-col items-center">
                        <h2 level={1} className="mb-2">${price}</h2>
                        <span>Per Month</span>
                    </div>
                    <Button className="mt-8"
                        onClick={onClick}
                    >
                        {selected ? `Selected` : `Select`}
                    </Button>
                </div>
            </div>
        </div>
    );
};

const basicPackageFeatures = [
    `One Product Only`,
    `Three Users`,
    `$5.99 per each additional user month`,
    `$9.99 each additional product per month`,
];

const professionalPackageFeatures = [
    `Five Products`,
    `Twelve Users`,
    `$2.99 each additional user per month`,
    `$3.99 each additional product`,
    `Third-Party Integrations`,
];

const Tier: FC = () => {
    const [selectedPackage, setSelectedPackage] = useState<"basic" | "professional">(
        `professional`
    );

    const handlePackageSelect = (packageName: "basic" | "professional") => {
        setSelectedPackage(packageName);
    };

    return (
        <div className="flex justify-center">
            <div className="w-full md:w-1/2 px-12 md:px-0 md:mr-12">
                <PackageCard
                    title="Basic"
                    price="9.99"
                    features={basicPackageFeatures}
                    selected={selectedPackage === `basic`}
                    onClick={() => handlePackageSelect(`basic`)}
                />
            </div>
            <div className="w-full md:w-1/2 px-12 md:px-0">
                <PackageCard
                    title="Professional"
                    price="29.99"
                    features={professionalPackageFeatures}
                    selected={selectedPackage === `professional`}
                    onClick={() => handlePackageSelect(`professional`)}
                />
            </div>
        </div>
    )
}

export default Tier