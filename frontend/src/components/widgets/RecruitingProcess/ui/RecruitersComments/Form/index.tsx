import { Button, Drawer, FileInput, Flex, Stack, Textarea } from '@mantine/core';
import { IMAGE_MIME_TYPE, MS_WORD_MIME_TYPE, PDF_MIME_TYPE } from '@mantine/dropzone';
import { useForm } from '@mantine/form';
import { Paperclip } from '@phosphor-icons/react/dist/ssr/Paperclip';
import { skipToken } from '@reduxjs/toolkit/query';
import { isNull, omitBy } from 'lodash-es';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';

import { useSelectedVacancy } from '@/components/widgets/RecruitingProcess/model/useSelectedVacancy';
import { Comment } from '@/components/widgets/RecruitingProcess/ui/RecruitersComments/Comment';
import { useGetCommentsAboutUserQuery, useSendCommentAboutCandidateMutation } from '@/services';
import { dataFormObject } from '@/shared/utils';
import { RecruiterCommentSchema } from '@/shared/validate/RecruiterComment.schema';

export const Form = ({ opened, close }: { opened: boolean; close: () => void }) => {
    const { selectedUser } = useSelectedVacancy();
    const [sendComments, { isLoading }] = useSendCommentAboutCandidateMutation();
    const form = useForm<z.infer<typeof RecruiterCommentSchema>>({
        mode: 'uncontrolled',
        initialValues: {
            file: null,
            text: '',
        },
        validate: zodResolver(RecruiterCommentSchema),
    });

    const { comments } = useGetCommentsAboutUserQuery(selectedUser ?? skipToken, {
        skip: selectedUser === '',
        selectFromResult: ({ data, isLoading }) => ({
            comments: data?.payload,
            isLoading,
        }),
    });

    const onSubmitFormHandler = form.onSubmit((values) => {
        if (!selectedUser) return;

        const body = omitBy(values, isNull) as unknown as z.infer<typeof RecruiterCommentSchema>;

        sendComments({
            user_id: selectedUser,
            body: dataFormObject(body),
        });
        form.reset();
    });

    return (
        <Drawer
            radius='md'
            offset={12}
            position='right'
            title='Комментарии рекрутера'
            opened={opened}
            onClose={close}
            styles={{
                body: {
                    height: '95%',
                },
            }}
        >
            <Flex w='100%' h='100%' direction='column' pos='relative'>
                <Stack w='100%'>
                    {!isLoading && comments?.map((comment) => <Comment key={comment.id} comment={comment} />)}
                </Stack>
                <form
                    onSubmit={onSubmitFormHandler}
                    style={{ width: '100%', marginTop: 'auto', position: 'sticky', bottom: 20 }}
                >
                    <Stack w='100%'>
                        <Textarea
                            key={form.key('text')}
                            {...form.getInputProps('text')}
                            rows={4}
                            placeholder='Введите комментарий'
                        />
                        <FileInput
                            key={form.key('file')}
                            {...form.getInputProps('file')}
                            accept={[...IMAGE_MIME_TYPE, ...PDF_MIME_TYPE, ...MS_WORD_MIME_TYPE].join(',')}
                            placeholder='Файл'
                            rightSection={<Paperclip size={20} />}
                        />
                        <Button loading={isLoading} type='submit'>
                            Отправить
                        </Button>
                    </Stack>
                </form>
            </Flex>
        </Drawer>
    );
};
