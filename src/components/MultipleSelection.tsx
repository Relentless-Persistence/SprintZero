import React from 'react';
import { Select, Space } from 'antd';
import type { SelectProps } from 'antd';

const options: SelectProps['options'] = [
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
];


const handleChange = (value: string[]) => {
    console.log(`selected ${value}`);
};

const MultipleSelection: React.FC = () => (
    <Space style={{ width: '100%' }} direction="vertical">
        <Select
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            placeholder="Please select"
            defaultValue={['mobile', 'web']}
            onChange={handleChange}
            options={options}
        />
    </Space>
);

export default MultipleSelection;