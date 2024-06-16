import { Fragment, useEffect, useState } from 'react';
import { Flex, Paper, Stack, Text } from '@mantine/core';
import { skipToken } from '@reduxjs/toolkit/query';
import dayjs from 'dayjs';
import { jwtDecode } from 'jwt-decode';
import { isArray } from 'lodash-es';
import { useRouter } from 'next/router';

import { ChatMessage } from '@/components/entities/ChatMessage';
import { useGetChatHistoryQuery } from '@/services';
import { ChatMessageModel, ChatModel } from '@/shared/types/common-models/Chat';

export const ChatMessages = () => {
    const {
        query: { chatId },
    } = useRouter();
    const isCorrectChatId = chatId && !isArray(chatId);
    const { data: messages } = useGetChatHistoryQuery(isCorrectChatId ? chatId : skipToken);

    const [messagesUpdatedList, setMessagesUpdatedList] = useState<Record<string, ChatMessageModel[]>>({});

    useEffect(() => {
        if (!messages) return;

        const reduced = messages?.reduceRight((acc: Record<string, ChatMessageModel[]>, chat) => {
            // Извлекаем дату из строки created_at, отбрасывая время и часовой пояс
            const date = chat.created_at!.split('T')[0]; // Получаем '2024-06-16'

            // Проверяем, существует ли уже такой ключ в аккумулирующем объекте
            if (!acc[date]) {
                acc[date] = []; // Если нет, создаем новый ключ с пустым массивом
            }

            acc[date].push(chat); // Добавляем чат в соответствующий массив
            return acc; // Возвращаем аккумулирующий объект для следующей итерации
        }, {});

        setMessagesUpdatedList(reduced);
    }, [messages]);

    useEffect(() => {
        const chatEl = document.querySelector<HTMLDivElement>('#chat-container');

        chatEl?.scrollTo({
            behavior: 'smooth',
            left: 0,
            top: chatEl?.scrollHeight,
        });
    }, [messages, messagesUpdatedList]);
    if (!messagesUpdatedList) return null;

    return (
        <Paper mt='auto' bg='transparent' px={40} py={16}>
            {Object.keys(messagesUpdatedList).map((key) => (
                <Fragment key={key}>
                    <Flex justify='center' py={40}>
                        <Text c='dimmed'>{dayjs(key).format('D MMMM')}</Text>
                    </Flex>
                    <Stack>
                        {messagesUpdatedList?.[key]?.map((message, index) => {
                            const isEqualToPast = messagesUpdatedList[key][index - 1]?.author?.id === message.author.id;

                            return (
                                <ChatMessage
                                    key={message.id}
                                    {...message}
                                    created_at={isEqualToPast ? null : message.created_at}
                                />
                            );
                        })}
                    </Stack>
                </Fragment>
            ))}
        </Paper>
    );
};
