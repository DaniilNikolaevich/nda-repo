import { useEffect, useState } from 'react';
import { Button, Flex, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { skipToken } from '@reduxjs/toolkit/query';
import { isArray } from 'lodash-es';
import { zodResolver } from 'mantine-form-zod-resolver';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { Form } from '@/components/widgets/CreateNewPost/ui/Form';
import { FormPreview } from '@/components/widgets/CreateNewPost/ui/FormPreview';
import { useGetArticleByIdQuery, useGetNewsTagsQuery } from '@/services/NewsService';
import { CreateNewPostSchema } from '@/shared/validate/CreateNewPost.schema';

import { CreateNewPostFormProps, CreateNewPostFormProvider } from './model';

export const CreateNewPost = () => {
    const [image, setImage] = useState<string>('');
    const [isPreview, setIsPreview] = useState(false);
    const {
        query: { id },
    } = useRouter();
    const { data: article } = useGetArticleByIdQuery(id && !isArray(id) ? id : skipToken);
    const { data: tags } = useGetNewsTagsQuery();

    const form = useForm<CreateNewPostFormProps>({
        initialValues: {
            tags: [],
            title: '',
            content: '',
            documents: null,
            brief_content: '',
        },
        validate: zodResolver(CreateNewPostSchema),
    });

    const props = {
        image,
        setIsPreview,
        isPreview,
    };

    useEffect(() => {
        if (!article || !tags) return;
        form.initialize({
            tags: article.tags,
            title: article.title,
            content: article.content ?? '',
            brief_content: article.brief_content as string,
            documents: !isArray(article.cover) ? [article.cover.url] : [],
        });
        if (!isArray(article.cover)) {
            setImage(article.cover.url);
        }
    }, [article]);

    return (
        <CreateNewPostFormProvider form={form}>
            <Form setImage={setImage} {...props} />
            <FormPreview {...props} />
            <Flex justify='space-between'>
                <Button onClick={() => setIsPreview(!isPreview)} variant={isPreview ? 'outline' : 'light'}>
                    {isPreview ? 'Вернуться к редактированию' : 'Предпросмотр'}
                </Button>
                <Group>
                    <Button component={Link} href='/recruiter' variant='outline'>
                        Отмена
                    </Button>
                    <Button type='submit' form='create-post-form'>
                        Сохранить и опубликовать
                    </Button>
                </Group>
            </Flex>
        </CreateNewPostFormProvider>
    );
};
