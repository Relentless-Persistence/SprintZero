import { ArrowRightOutlined, CopyOutlined, FileTextOutlined, ReadOutlined } from "@ant-design/icons";
import { Card, Tag } from "antd";

import type { FC } from "react";

interface StoryTaskContainerProps {
    key: string,
    title: string,
    epicName: string,
    featureName: string,
    selectedStoryName: string
}

const StoryTaskContainer: FC<StoryTaskContainerProps> = ({ key, title, epicName, featureName, selectedStoryName }) => {
    return (
        <Card
            key={key}
            type="inner"
            title={<span className="cursor-pointer">{title}</span>}
        >
            <div className="flex flex-wrap item-center gap-1">
                <Tag icon={<ReadOutlined />}>{epicName}</Tag>
                <ArrowRightOutlined />
                <Tag icon={<CopyOutlined />}>{featureName}</Tag>
                <ArrowRightOutlined />
                <Tag icon={<FileTextOutlined />}>{selectedStoryName}</Tag>
            </div>
        </Card>
    )
}

export default StoryTaskContainer