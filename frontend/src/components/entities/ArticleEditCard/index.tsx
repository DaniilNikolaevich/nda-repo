import { ReactNode } from 'react';
import { Flex, Paper, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';

import { News } from '@/shared/types/common-models';
import { PartnersNewsBadge } from '@/shared/ui';

interface ArticleEditCardProps extends News {
    removeActionSlot?: ReactNode;
    editActionSlot?: ReactNode;
}

export const ArticleEditCard = ({
    removeActionSlot,
    editActionSlot,
    title,
    is_external,
    created_at,
}: ArticleEditCardProps) => (
    <Paper withBorder px='var(--size-lg)' py='var(--size-sm)'>
        <Flex justify='space-between' align='center'>
            <Flex direction='column'>
                <Title fz='md' maw={874} lineClamp={2} order={3} mb='var(--size-xs)'>
                    {title}
                </Title>
                <Flex justify='flex-start' gap='var(--size-sm)'>
                    <Text component='time' dateTime={created_at}>
                        {dayjs(created_at).format('DD.MM.YYYY')}
                    </Text>
                    <PartnersNewsBadge ml={0} hidden={!is_external} />
                </Flex>
            </Flex>
            <Flex gap='var(--size-sm)'>
                {editActionSlot}
                {removeActionSlot}
            </Flex>
        </Flex>
    </Paper>
);
