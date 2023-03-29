import { Divider, Form, Input } from "antd"

import type { FC } from "react"

const Configuration: FC = () => {
    return (
        <>
            <div className="flex">
                <div className="w-1/2">
                    <div className="leading-normal mb-2">
                        <p className="text-lg font-medium">Product name</p>
                        <p className="text-base text-textTertiary">What are we gonna call this thing?</p>
                    </div>

                    <Input type="email" placeholder="Enter your email" />

                </div>
                {/* <div className="flex-none"><Divider type="vertical" /></div> */}
                <div className="w-1/2">
                    <div className="leading-normal mb-2">
                        <p className="text-lg font-medium">Product name</p>
                        <p className="text-base text-textTertiary">What are we gonna call this thing?</p>
                    </div>

                    <Input type="email" placeholder="Enter your email" />
                </div>

            </div>
            <div className="flex">
                <div className="w-full">
                    <div className="leading-normal mb-2">
                        <p className="text-lg font-medium">Team members</p>
                        <p className="text-base text-textTertiary">Who's gonna saddle up with you?</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Configuration