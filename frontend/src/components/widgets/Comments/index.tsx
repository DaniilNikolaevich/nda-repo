import { Anchor, Button, Paper, Stack, Text, Textarea, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { skipToken } from '@reduxjs/toolkit/query';
import { useUnit } from 'effector-react';
import { isArray } from 'lodash-es';
import { zodResolver } from 'mantine-form-zod-resolver';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { Comment } from '@/components/entities';
import { $isAuth } from '@/services';
import { useCreateCommentMutation, useGetArticleCommentsQuery } from '@/services/NewsService';
import { getDeclinations } from '@/shared/utils';
import { CommentsSchema } from '@/shared/validate';

export const Comments = () => {
    const isAuth = useUnit($isAuth);
    const [createComment] = useCreateCommentMutation();
    const {
        query: { id },
    } = useRouter();
    const { data: comments } = useGetArticleCommentsQuery(id && !isArray(id) ? id : skipToken);

    const form = useForm({
        initialValues: {
            content: '',
        },
        validate: zodResolver(CommentsSchema),
    });

    const onSubmit = form.onSubmit(({ content }) => {
        if (!id || isArray(id)) return;

        try {
            createComment({
                id,
                content,
            });
            form.reset();
        } catch (e) {
            if (e instanceof Error) {
                console.error(e.message);
            }
            notifications.show({
                color: 'red',
                title: 'Ошибка!',
                message: 'Произошла ошибка, попробуйте позже',
            });
        }
    });

    const isCommentsExists = comments && comments?.length > 0;

    const title = isAuth ? 'Добавить комментарий' : 'Комментарии';
    const declinations = getDeclinations({
        count: comments?.length ?? 0,
        few: 'комментария',
        many: 'комментариев',
        one: 'комментарий',
    });
    const titleContent = isCommentsExists ? declinations : title;

    return (
        <Paper py='var(--size-lg)' px='var(--size-5xl)'>
            <Stack gap='var(--size-lg)'>
                <Title order={3}>{titleContent}</Title>
                {comments?.map((comment) => <Comment key={comment.id} {...comment} />)}
                {!isCommentsExists && <Text>Никто пока не оставил комментариев</Text>}
                {!isAuth && (
                    <Text>
                        <Anchor component={Link} href='/auth'>
                            Войдите
                        </Anchor>{' '}
                        или{' '}
                        <Anchor component={Link} href='/register'>
                            зарегистрируйтесь
                        </Anchor>{' '}
                        в системе, чтобы оставлять комментарии
                    </Text>
                )}
                {isAuth && (
                    <form onSubmit={onSubmit}>
                        <Stack>
                            <Textarea
                                key={form.key('content')}
                                {...form.getInputProps('content')}
                                rows={4}
                                placeholder='Введите комментарий'
                            />
                            <Button w='fit-content' type='submit'>
                                Отправить
                            </Button>
                        </Stack>
                    </form>
                )}
            </Stack>
        </Paper>
    );
};
