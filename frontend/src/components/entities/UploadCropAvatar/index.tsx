import { useCallback, useRef, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Avatar, Button, FileInput, Flex, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { STORAGE, useUploadRecruiterAvatarMutation, useUploadUserAvatarMutation } from '@/services';
import { dataFormObject, getCroppedImg } from '@/shared/utils';

import s from './UploadCropAvatar.module.css';

interface UploadCropAvatarProps {
    avatarUrl?: string | null;
}

export const UploadCropAvatar = ({ avatarUrl }: UploadCropAvatarProps) => {
    const [uploadAvatar] = useUploadUserAvatarMutation();
    const [uploadRecruiterAvatar] = useUploadRecruiterAvatarMutation();

    const fileInputRef = useRef<HTMLButtonElement | null>(null);

    const [opened, { open, close }] = useDisclosure(false);

    const [avatarFile, setAvatarFile] = useState<string | null>(null);
    const [avatarFileUpload, setAvatarFileUpload] = useState<File | null>(null);

    const [uploadImage, setUploadImage] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [croppedImage, setCroppedImage] = useState<string | null>(null);

    const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
        if (croppedAreaPixels) {
            setCroppedAreaPixels(croppedAreaPixels);
        }
    };

    const handleButtonClick = () => {
        if (fileInputRef?.current) {
            fileInputRef.current.click();
        }
    };

    const handleAvatarChange = (files: File | null) => {
        const file = files;
        if (file) {
            open();
            setUploadImage(URL.createObjectURL(file));
            const reader = new FileReader();
            reader.onload = () => {
                setAvatarFile(reader.result as string);
            };
            setAvatarFileUpload(file);
            reader.readAsDataURL(file);
        }
    };

    const showCroppedImage = useCallback(async () => {
        try {
            if (croppedAreaPixels && uploadImage) {
                const croppedImage = await getCroppedImg(uploadImage, croppedAreaPixels, rotation);

                const formData = dataFormObject({ file: avatarFileUpload });

                STORAGE.getRole() === 'recruiter' ? uploadRecruiterAvatar(formData) : uploadAvatar(formData);

                setCroppedImage(croppedImage);
                close();
            }
        } catch (e) {
            console.error(e);
        }
    }, [croppedAreaPixels, rotation, avatarFileUpload, uploadImage]);

    return (
        <Flex direction='column' align='center' gap='sm'>
            <Avatar src={croppedImage ?? avatarUrl} size={120} />
            <Modal opened={Boolean(avatarFile) && opened} classNames={{ content: s.modalContent }} onClose={close}>
                {avatarFile && (
                    <>
                        <Flex style={{ zIndex: 1, position: 'absolute', left: 'calc(50% - 60px)', bottom: 10 }}>
                            <Button onClick={showCroppedImage}>Сохранить</Button>
                        </Flex>
                        <Cropper
                            image={avatarFile}
                            crop={crop}
                            rotation={rotation}
                            zoom={zoom}
                            cropShape='round'
                            aspect={4 / 4}
                            onCropChange={setCrop}
                            onRotationChange={setRotation}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                        />
                    </>
                )}
            </Modal>
            <FileInput
                accept='image/*'
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={(files) => handleAvatarChange(files)}
            />
            {!avatarFile ? (
                <Button onClick={handleButtonClick} style={{ marginBottom: 16 }} variant='transparent'>
                    Загрузить файл
                </Button>
            ) : (
                <Button onClick={handleButtonClick} style={{ marginBottom: 16 }} variant='transparent'>
                    Изменить фото
                </Button>
            )}
        </Flex>
    );
};
