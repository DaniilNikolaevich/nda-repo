import { useEffect } from 'react';
import { Button, Flex, Grid, Loader, Paper, TextInput, Title, VisuallyHidden } from '@mantine/core';
import { skipToken } from '@reduxjs/toolkit/query';
import { Centrifuge } from 'centrifuge';
import { isArray } from 'lodash-es';
import { useRouter } from 'next/router';

import { ChatForm, ChatHeader, ChatList, ChatMessages } from '@/components/widgets';
import { EmptyState } from '@/components/widgets/EmptyState';
import { BaseLayout } from '@/layouts';
import {
    STORAGE,
    useGetAllMyChatsQuery,
    useGetChatHistoryQuery,
    useIsRecruiter,
    useSendChatMessageMutation,
} from '@/services';
import { API_ROUTES } from '@/shared/api';

import s from './ChatsPage.module.css';

function ChatsPage() {
    const {
        query: { chatId },
    } = useRouter();
    const token = STORAGE.getChatToken();
    const { data: chats, isLoading } = useGetAllMyChatsQuery();
    const isChatsExists = Boolean(chats && chats.chats.length > 0);
    const isCorrectChatId = chatId && !isArray(chatId);

    const { refetch } = useGetChatHistoryQuery(isCorrectChatId ? chatId : skipToken);

    useEffect(() => {
        if (!token || !chatId || isArray(chatId)) return;

        const client = new Centrifuge(API_ROUTES.ws_chat, {
            token,
        });

        const sub = client.newSubscription(chatId);

        sub.subscribe();

        sub.on('publication', refetch);

        client.connect();

        return () => client.disconnect();
    }, [chatId, token]);

    return (
        <BaseLayout title='Чаты'>
            <section>
                <VisuallyHidden>Страница чатов</VisuallyHidden>
                <Paper mt={-16} mx={-16}>
                    {isLoading && <Loader pos='fixed' top='50%' left='50%' />}
                    <Grid className={s.root} h='calc(100vh - 69px)'>
                        <Grid.Col span={3} p={0} h='calc(100vh - 69px)' style={{ overflow: 'auto' }}>
                            <Paper radius={0} component='aside' className={s.aside}>
                                <Title py={12} px={20} fz={32} mb={20}>
                                    Чаты
                                </Title>
                                {!isLoading && isChatsExists && <ChatList />}
                            </Paper>
                        </Grid.Col>
                        <Grid.Col
                            id='chat-container'
                            bg='gray.0'
                            p={0}
                            span={9}
                            h='calc(100vh - 69px)'
                            style={{ overflowY: 'auto' }}
                        >
                            <EmptyState show={isChatsExists} />
                            {!isLoading && isChatsExists && chatId && (
                                <>
                                    <ChatHeader />
                                    <Flex h='calc(100% - 144px)' direction='column'>
                                        <ChatMessages />
                                        <ChatForm />
                                    </Flex>
                                </>
                            )}
                        </Grid.Col>
                    </Grid>
                </Paper>
            </section>
        </BaseLayout>
    );
}

export default ChatsPage;
