import { Avatar, Flex, Image, Stack, Text } from '@mantine/core';
import NextImage from 'next/image';

import type { CommentModel } from '@/shared/types/common-models';

export const Comment = ({ content, user }: CommentModel) => (
    <Stack gap='var(--size-sm)'>
        <Flex gap='var(--size-sm)'>
            <Avatar
                radius='md'
                w={40}
                h={40}
                alt={`Аватар пользователя ${user.fullname}`}
                src={user.avatar_thumbnail_url ?? ''}
            />
            <Stack gap='var(--size-xs)'>
                <Text fw={600}>{user.fullname}</Text>
            </Stack>
        </Flex>
        <Text fz='lg'>{content}</Text>
    </Stack>
);
