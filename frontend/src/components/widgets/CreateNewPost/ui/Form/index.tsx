import { useEffect } from 'react';
import { Flex, Group, rem, Text, TextInput } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import { skipToken } from '@reduxjs/toolkit/query';
import { IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { Content, useEditor } from '@tiptap/react';
import { isArray } from 'lodash-es';
import { useRouter } from 'next/router';

import { usCreateNewPostContext } from '@/components/widgets/CreateNewPost/model';
import { PostTagsInput } from '@/components/widgets/CreateNewPost/ui/PostTagsInput';
import { Editor } from '@/components/widgets/Editor';
import { editorOptions } from '@/components/widgets/Editor/options';
import {
    useCreateNewArticleMutation,
    useGetArticleByIdQuery,
    useUploadArticleCoverMutation,
} from '@/services/NewsService';
import { MemoImage } from '@/shared/ui/MemoImage';
import { dataFormObject } from '@/shared/utils';

export const Form = ({
    isPreview,
    image,
    setImage,
}: {
    isPreview: boolean;
    setIsPreview: (b: boolean) => void;
    image: string;
    setImage: (s: string) => void;
}) => {
    const {
        query: { id },
        replace,
    } = useRouter();
    const { data: article } = useGetArticleByIdQuery(id && !isArray(id) ? id : skipToken);

    const { getValues, onSubmit, setFieldValue, errors, key, getInputProps } = usCreateNewPostContext();

    const [uploadCover, { data }] = useUploadArticleCoverMutation();
    const [createArticle] = useCreateNewArticleMutation();

    const editor = useEditor({
        extensions: editorOptions,
        content: getValues()?.content ?? '',
        onUpdate(props) {
            const content = props.editor.getHTML();
            setFieldValue('content', content);
        },
    });

    const brief = useEditor({
        extensions: editorOptions,
        content: getValues()?.brief_content ?? '',
        onUpdate(props) {
            const content = props.editor.getHTML();
            setFieldValue('brief_content', content);
        },
    });
    const onFileUpload = (file: File) => {
        setImage(URL.createObjectURL(file));
        const formData = dataFormObject({
            file,
            is_cover: true,
        });
        uploadCover(formData).unwrap();
    };
    const onSubmitHandler = onSubmit((values) => {
        try {
            createArticle(values);
            replace(`/recruiter/process/news`);
        } catch (e) {
            if (e instanceof Error) {
                console.error(e.message);
            }
            notifications.show({
                color: 'red',
                message: 'Произошла ошибка!',
                title: 'Ошибка!',
            });
        }
    });

    useEffect(() => {
        if (!data) return;
        setFieldValue('documents', [data?.id ?? '']);
    }, [data]);

    useEffect(() => {
        if (!article) return;
        editor?.commands.setContent(article.content as Content);
        brief?.commands.setContent(article.brief_content as Content);
        if (!isArray(article.cover)) {
            setFieldValue('documents', [article.cover.id]);
        }
    }, [article]);

    return (
        <form id='create-post-form' hidden={isPreview} onSubmit={onSubmitHandler}>
            <Flex direction='column' gap='var(--size-xl)' mb='var(--size-5xl)'>
                <Dropzone
                    h={420}
                    key={key('documents')}
                    {...getInputProps('documents')}
                    onDrop={(file) => {
                        onFileUpload(file[0]);
                    }}
                    style={{
                        overflow: 'hidden',
                        borderColor: image ? 'transparent' : 'var(--mantine-color-gray-4)',
                    }}
                    p={image ? 0 : 'var(--size-md)'}
                    accept={IMAGE_MIME_TYPE}
                >
                    {image && <MemoImage src={image} alt='image' />}
                    <Group justify='center' gap='xl' mih={420} style={{ pointerEvents: 'none' }}>
                        <Dropzone.Accept>
                            <IconUpload
                                style={{
                                    width: rem(52),
                                    height: rem(52),
                                    color: 'var(--mantine-color-indigo-6)',
                                }}
                                stroke={1.5}
                            />
                        </Dropzone.Accept>
                        <Dropzone.Reject>
                            <IconX
                                style={{
                                    width: rem(52),
                                    height: rem(52),
                                    color: 'var(--mantine-color-red-6)',
                                }}
                                stroke={1.5}
                            />
                        </Dropzone.Reject>
                        <Dropzone.Idle>
                            <IconPhoto
                                style={{
                                    width: rem(52),
                                    height: rem(52),
                                    color: 'var(--mantine-color-dimmed)',
                                }}
                                stroke={1.5}
                            />
                        </Dropzone.Idle>
                        <div>
                            <Text size='xl' inline c='ingigo'>
                                Нажмите, чтобы загрузить обложку
                            </Text>
                        </div>
                    </Group>
                </Dropzone>
                <PostTagsInput />
                <TextInput
                    placeholder='Введите заголовок'
                    label='Заголовок новости'
                    key={key('title')}
                    {...getInputProps('title')}
                />
                <Flex direction='column'>
                    <Text fw={500} fz={14}>
                        Бриф новости
                    </Text>
                    <Editor editor={brief} />
                </Flex>
                <Flex direction='column'>
                    <Text fw={500} fz={14}>
                        Текст
                    </Text>
                    <Editor editor={editor} />
                </Flex>
                {errors.content && (
                    <Text mt={-24} c='red' fz={12}>
                        {errors.content}
                    </Text>
                )}
            </Flex>
        </form>
    );
};
