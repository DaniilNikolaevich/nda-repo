import { Box, Button, Flex, Stack, Text } from '@mantine/core';
import { ArrowSquareOut } from '@phosphor-icons/react/dist/ssr/ArrowSquareOut';
import { ChatDots } from '@phosphor-icons/react/dist/ssr/ChatDots';
import dayjs from 'dayjs';
import Link from 'next/link';

import s from './ResponseCard.module.scss';

interface ResponseCardProps {
    title: string;
    date: string;
    id: string;
    chatId: string;
}

export const ResponseCard = ({ title, date, id, chatId }: ResponseCardProps) => (
    <Flex className={s.root}>
        <Flex className={s.link} component={Link} href={`/vacancy/${id}`}>
            <Stack gap='var(--size-xxs)'>
                <Text className={s.title} fw='600' fz='var(--size-md)'>
                    {title}
                </Text>
                <Box component='time'>
                    <Text fz={14}>Вы откликнулись {dayjs(date).format('DD.MM.YYYY')}</Text>
                </Box>
            </Stack>
        </Flex>
        <Flex gap='var(--size-sm)'>
            <Button
                component={Link}
                variant='light'
                href={`/chats?chatId=${chatId}`}
                leftSection={<ChatDots size={20} weight='bold' />}
            >
                Перейти в чат
            </Button>
            <Button
                component={Link}
                href={`/vacancy/${id}`}
                variant='outline'
                leftSection={<ArrowSquareOut size={20} weight='bold' />}
            >
                Посмотреть описание
            </Button>
        </Flex>
    </Flex>
);
