import { useEffect } from 'react';
import { Avatar, Button, Flex, Indicator, Stack, Text, useMantineColorScheme } from '@mantine/core';
import { skipToken } from '@reduxjs/toolkit/query';
import { useUnit } from 'effector-react';
import { isArray } from 'lodash-es';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { useChat } from '@/_app/providers';
import { $isRecruiter, useGetAllMyChatsQuery, useGetChatHistoryQuery, useLazyGetNotificationsQuery } from '@/services';

export const ChatList = () => {
    const {
        query: { chatId },
    } = useRouter();
    const isRecruiter = useUnit($isRecruiter);
    const { data: chats } = useGetAllMyChatsQuery();
    const { messagesCounter } = useChat();
    const { refetch, isUninitialized } = useGetChatHistoryQuery(chatId && !isArray(chatId) ? chatId : skipToken, {
        refetchOnMountOrArgChange: true,
    });
    const [getNotifications] = useLazyGetNotificationsQuery();

    const { colorScheme } = useMantineColorScheme();
    const isDarkTheme = colorScheme === 'dark';

    const getActiveChatStyle = (id: string) =>
        chatId === id ? { bg: isDarkTheme ? 'dark.2' : 'gray.1' } : { bg: 'transparent' };

    useEffect(() => {
        if (isUninitialized) return;
        refetch().then(() => {
            getNotifications();
        });
    }, [chatId]);

    return (
        <Stack gap={0}>
            {chats?.chats?.map((chat) => {
                const avatar = isRecruiter ? chat?.candidate?.avatar_thumbnail_url : '';
                let chatName = chat.name;

                if (isRecruiter && chatName.includes('Чат с кандидатом')) {
                    chatName = 'Чат с кандидатом';
                }

                return (
                    <Button
                        radius={0}
                        key={chat.id}
                        component={Link}
                        href={`/chats?chatId=${chat.id}`}
                        c={isDarkTheme ? 'white' : 'black'}
                        mih={68}
                        h='fit-content'
                        py={16}
                        px={20}
                        style={{ textAlign: 'left' }}
                        styles={{
                            inner: { justifyContent: 'flex-start' },
                        }}
                        {...getActiveChatStyle(chat.id)}
                    >
                        <Flex justify='flex-start' align='center' gap={12}>
                            <Avatar miw={60} h={60} src={avatar} radius='md' />
                            <Stack gap={4}>
                                <Text fz={14}>{chatName}</Text>
                                {isRecruiter && (
                                    <>
                                        <Text lh={1} hidden={chatName.includes('Чат по вакансии')} fw={600} fz={18}>
                                            {chat.name.replace('Чат с кандидатом', '')}
                                        </Text>
                                        <Text fz={14} c='dimmed'>
                                            {chat?.candidate?.info?.preferred_position?.name}
                                        </Text>
                                    </>
                                )}
                            </Stack>
                            {messagesCounter?.[chat.id] ? (
                                <Indicator
                                    label={messagesCounter?.[chat.id]}
                                    pos='absolute'
                                    bottom={20}
                                    right={20}
                                    size={20}
                                />
                            ) : null}
                        </Flex>
                    </Button>
                );
            })}
        </Stack>
    );
};
