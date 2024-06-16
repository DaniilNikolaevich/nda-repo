import { useEffect } from 'react';
import { Button } from '@mantine/core';
import { ChatDots } from '@phosphor-icons/react/dist/ssr/ChatDots';
import { useRouter } from 'next/router';

import { useCreateChatWithCandidate } from '@/services/RecruiterService/hooks';

export const CreateChatWithCandidateButton = ({ id }: { id: string }) => {
    const { push } = useRouter();
    const { handleCreateChat, chatInfo } = useCreateChatWithCandidate();

    useEffect(() => {
        if (chatInfo) {
            push(`/chats?chatId=${chatInfo.chat_id}`);
        }
    }, [chatInfo]);

    return (
        <Button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCreateChat(id);
            }}
            variant='light'
            leftSection={<ChatDots weight='bold' size={16} />}
        >
            В чат
        </Button>
    );
};
