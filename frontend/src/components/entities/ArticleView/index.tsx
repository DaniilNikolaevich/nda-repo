import type { ReactNode } from 'react';
import { Box, Flex, Paper, Pill, PillGroup, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';

import type { News } from '@/shared/types/common-models';
import { MemoImage } from '@/shared/ui/MemoImage';

interface ArticleViewProps extends News {
    image?: string;
    commentsActionSlot?: ReactNode;
    likesActionSlot?: ReactNode;
}
export const ArticleView = ({ image, title, tags, content, likesActionSlot, commentsActionSlot }: ArticleViewProps) => (
    <Paper bg='white' py='var(--size-lg)' px='var(--size-5xl)'>
        <Flex direction='column' gap='var(--size-xl)' mb='var(--size-lg)'>
            <Paper radius={16} h={420} style={{ overflow: 'hidden' }}>
                {image && <MemoImage alt='image' src={image} width={870} height={420} />}
            </Paper>
            <Flex justify='space-between' align='center'>
                {tags && (
                    <PillGroup>
                        {tags.map((tag) => (
                            <Pill key={tag?.id}>{tag?.name}</Pill>
                        ))}
                    </PillGroup>
                )}
                <Text size='sm' c='dimmed' component='time' dateTime={dayjs().format('YYYY-MM-DD')}>
                    {dayjs().format('DD.MM.YYYY')}
                </Text>
            </Flex>
            <Title order={4}>{title}</Title>
            <Box className='editor-preview' dangerouslySetInnerHTML={{ __html: content as string }} />
        </Flex>
        <Flex gap='var(--size-lg)'>
            {likesActionSlot}
            {commentsActionSlot}
        </Flex>
    </Paper>
);
