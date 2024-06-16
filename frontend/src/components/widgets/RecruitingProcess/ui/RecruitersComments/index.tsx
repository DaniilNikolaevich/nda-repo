import { Button, Center, Divider, Flex, Group, Loader, Paper, Stack, Text, Textarea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { PencilSimple } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { skipToken } from '@reduxjs/toolkit/query';
import dayjs from 'dayjs';

import { useSelectedVacancy } from '@/components/widgets/RecruitingProcess/model/useSelectedVacancy';
import { useGetCommentsAboutUserQuery } from '@/services';

import { Comment } from './Comment';
import { Form } from './Form';

export const RecruitersComments = () => {
    const [opened, { open, close }] = useDisclosure(false);
    const { selectedUser } = useSelectedVacancy();
    const { comments, isLoading } = useGetCommentsAboutUserQuery(selectedUser ?? skipToken, {
        skip: selectedUser === '',
        selectFromResult: ({ data, isLoading }) => ({
            comments: data?.payload,
            isLoading,
        }),
    });

    const isExistsComments = comments && comments.length > 0;

    return (
        <>
            <Paper>
                <Stack>
                    <Group gap={8}>
                        <PencilSimple size={20} weight='bold' />
                        <Text fw={600} fz={18}>
                            Комментарии рекрутера
                        </Text>
                        {isLoading && (
                            <Center>
                                <Loader />
                            </Center>
                        )}
                    </Group>
                    <Stack>
                        {!isExistsComments && (
                            <Text fw={600} fz={16}>
                                Пока комментариев нет
                            </Text>
                        )}
                        {!isLoading && comments?.map((comment) => <Comment key={comment.id} comment={comment} />)}
                    </Stack>
                    <Button onClick={open} w='fit-content' variant='light'>
                        Посмотреть все и добавить новый
                    </Button>
                </Stack>
                <Divider my='var(--size-lg)' />
            </Paper>
            <Form opened={opened} close={close} />
        </>
    );
};
