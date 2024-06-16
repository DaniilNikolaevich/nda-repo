import { Avatar, Box, Flex, Group, Paper, Stack, Text } from '@mantine/core';
import dayjs from 'dayjs';
import { jwtDecode } from 'jwt-decode';

import { STORAGE } from '@/services';
import { ChatMessageModel } from '@/shared/types/common-models/Chat';

export const ChatMessage = ({ author, created_at, message }: ChatMessageModel) => {
    const token = STORAGE.getToken();
    const isMe = token && jwtDecode(token).sub === author.id;

    return (
        <Box>
            <Flex direction={isMe ? 'row-reverse' : 'row'}>
                <Stack maw={620} w='100%'>
                    {created_at && (
                        <Flex gap={8} align='center' direction={isMe ? 'row-reverse' : 'row'}>
                            <Avatar radius='md' src={author.avatar_thumbnail_url} />
                            <Text mt={-16} fw={600}>
                                {author?.name}
                            </Text>
                            <Text c='dimmed' mt={-16}>
                                {dayjs(created_at).format('HH:mm')}
                            </Text>
                        </Flex>
                    )}
                    <Paper
                        className='editor-preview'
                        p={12}
                        mb={12}
                        withBorder
                        pos='relative'
                        mt={-20}
                        maw={620}
                        w='100%'
                        right={isMe ? 40 : 'unset'}
                        left={!isMe ? 40 : 'unset'}
                        dangerouslySetInnerHTML={{ __html: message as string }}
                    />
                </Stack>
            </Flex>
        </Box>
    );
};
