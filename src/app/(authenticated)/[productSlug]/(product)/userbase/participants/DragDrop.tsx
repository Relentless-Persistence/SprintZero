import { InboxOutlined } from '@ant-design/icons';
import { Upload, message } from 'antd';

import type { UploadProps } from 'antd';
import type { FC } from 'react';

const { Dragger } = Upload;

const props: UploadProps = {
    name: `file`,
    multiple: true,
    action: `https://www.mocky.io/v2/5cc8019d300000980a055e76`,
    onChange(info) {
        const { status } = info.file;
        if (status !== `uploading`) {
            console.log(info.file, info.fileList);
        }
        if (status === `done`) {
            message.success(`${info.file.name} file uploaded successfully.`);
        } else if (status === `error`) {
            message.error(`${info.file.name} file upload failed.`);
        }
    },
    onDrop(e) {
        console.log(`Dropped files`, e.dataTransfer.files);
    },
};

const DragDrop: FC = () => (
    <Dragger {...props} className="grow">
        <p className="ant-upload-drag-icon">
            <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag audio file to this area to upload + transcribe</p>
        <p className="ant-upload-hint">
            .mp3 or .m4a only
        </p>
    </Dragger>
);

export default DragDrop;