import { InboxOutlined } from '@ant-design/icons';
import { Upload, message } from 'antd';
import {
    getDownloadURL,
    ref,
    uploadBytesResumable,
} from "firebase/storage";


// import type { RcFile, UploadProps } from 'antd';
import type { RcFile } from 'antd/es/upload/interface';
import type { Dispatch, FC, SetStateAction } from 'react';

import { storage } from "~/utils/firebase"

const { Dragger } = Upload;

interface DragDropProps {
    setAudioUrl: Dispatch<SetStateAction<string>>;
    setStorageBucketUri: Dispatch<SetStateAction<string>>;
}

const DragDrop: FC<DragDropProps> = ({ setAudioUrl, setStorageBucketUri }) => {

    function beforeUpload(file: RcFile) {
        const isAudio = file.type === `audio/mpeg` || file.type === `audio/wav` || file.type === `audio/x-m4a`;
        if (!isAudio) {
            void message.error(`You can only upload MP3, WMA or M4A audio files!`);
        }
        return isAudio;
    }

    const onUpload = (file: RcFile) => {
        const storageRef = ref(storage, `/participants/audio/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on(
            `state_changed`,
            (snap) => {
                let percentage = (snap.bytesTransferred / snap.totalBytes) * 100;
            },
            (err) => {
                void message.error(`Something went wrong with the upload!`);
                console.error(err);
            },
            () => {
                void getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    const storageBucketUri = `gs://${storageRef.bucket}/${storageRef.fullPath}`;
                    setAudioUrl(downloadURL);
                    setStorageBucketUri(storageBucketUri)
                });
            }
        );
    };

    return (
        <Dragger action={(file: RcFile): string => {
            onUpload(file)
            return ``
        }} beforeUpload={beforeUpload} className="grow">
            <p className="ant-upload-drag-icon">
                <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag audio file to this area to upload + transcribe</p>
            <p className="ant-upload-hint">
                .mp3, .m4a, or .wav only
            </p>
        </Dragger>
    );
}

export default DragDrop;