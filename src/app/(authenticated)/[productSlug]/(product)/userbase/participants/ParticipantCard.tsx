import { CopyOutlined, PhoneOutlined, ReadOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Tag } from "antd";

import type { FC } from "react";

const ParticipantCard: FC = () => {
    return (
        <Card
            //key={member.id}
            type="inner"
            title={
                <div className="my-4 flex items-center gap-4">
                    <Avatar size="large" icon={<UserOutlined />} shape="square" />
                    <div>
                        {/* <p>{member.data().name}</p> */}
                        <p>Adil Gurbanov</p>
                        <p className="text-sm font-normal text-textTertiary">
                            Houston, TX, USA
                        </p>
                    </div>
                </div>
            }
            extra={
                <Button
                //onClick={() => onDrawerOpen()}
                >
                    View
                </Button>
            }
        >
            <div className="flex gap-2">
                <Tag color="#f9f0ff" icon={<UserOutlined />} className="!border-current !text-[#722ed1]">
                    Head of Engineer
                </Tag>
                <Tag color="#e6fffb" icon={<PhoneOutlined />} className="!border-current !text-[#006d75]">
                    (406) 120-8888
                </Tag>
            </div>
        </Card>
    )
}

export default ParticipantCard