import { useEffect } from 'react';
import { Avatar, Button, Flex, Stack, Text } from '@mantine/core';
import { skipToken } from '@reduxjs/toolkit/query';
import { isArray } from 'lodash-es';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { useGetAllMyChatsQuery, useGetChatHistoryQuery, useIsRecruiter, useSendChatMessageMutation } from '@/services';

export const ChatList = () => {
    const {
        query: { chatId },
    } = useRouter();
    const [isRecruiter] = useIsRecruiter();
    const { data: chats, isLoading } = useGetAllMyChatsQuery();
    useGetChatHistoryQuery(chatId && !isArray(chatId) ? chatId : skipToken, {
        refetchOnMountOrArgChange: true,
    });

    const getActiveChatStyle = (id: string) => (chatId === id ? { bg: 'gray.1' } : { bg: 'transparent' });

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
                        c='black'
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
                            <Avatar w={60} h={60} src={avatar} radius='md' />
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
                        </Flex>
                    </Button>
                );
            })}
        </Stack>
    );
};
