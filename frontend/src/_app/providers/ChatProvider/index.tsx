import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { Centrifuge } from 'centrifuge';
import { isArray } from 'lodash-es';
import { useRouter } from 'next/router';

import { STORAGE, useGetAllMyChatsQuery, useGetNotificationsQuery, useLazyGetChatHistoryQuery } from '@/services';
import { API_ROUTES } from '@/shared/api';

interface ChatCtxProps {
    isLoading: boolean;
    isChatsExists: boolean;
    chatId: string;
    messageType: string;
    handleChangeMessageType: (s: string) => void;
    messagesCounter?: {
        total: number;
        [K: string]: number;
    };
}

const ChatCtx = createContext<ChatCtxProps>({} as ChatCtxProps);

export function ChatProvider({ children }: PropsWithChildren) {
    const {
        query: { chatId },
    } = useRouter();
    const token = STORAGE.getChatToken();
    const { data: chats, isLoading } = useGetAllMyChatsQuery(undefined, {
        skip: !token,
        pollingInterval: 10_000,
    });
    const { data: messagesCounter } = useGetNotificationsQuery(undefined, {
        pollingInterval: 10_000,
        skip: !token,
    });

    const [messageType, setMessageType] = useState<string>('all');

    const isCorrectChatId = chatId && !isArray(chatId);
    const isChatsExists = Boolean(chats && chats.chats.length > 0);
    const handleChangeMessageType = (value: string) => {
        setMessageType(value);
    };

    const [refetch] = useLazyGetChatHistoryQuery();

    const memoizedValues = useMemo(
        () => ({
            isLoading,
            isChatsExists,
            chatId: isCorrectChatId ? chatId : '',
            messageType,
            handleChangeMessageType,
            messagesCounter,
        }),
        [isLoading, isChatsExists, chatId, messageType, messagesCounter]
    );

    useEffect(() => {
        if (!token || !chatId || isArray(chatId)) return;

        const client = new Centrifuge(API_ROUTES.ws_chat, {
            token: token ?? '',
        });
        const sub = client.newSubscription(chatId);

        sub.subscribe();

        if (isCorrectChatId) sub.on('publication', () => refetch(chatId));

        client.connect();

        return () => client.disconnect();
    }, [chatId, token]);

    return <ChatCtx.Provider value={memoizedValues}>{children}</ChatCtx.Provider>;
}

export const useChat = () => {
    const ctx = useContext(ChatCtx);
    if (!ctx) {
        throw new Error('Chat Context Must be in Provider');
    }

    return ctx;
};
