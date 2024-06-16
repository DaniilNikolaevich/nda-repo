import { Button, Paper, Stack, Text, Title } from '@mantine/core';
import { TelegramLogo } from '@phosphor-icons/react/dist/ssr/TelegramLogo';
import Link from 'next/link';

export const TelegramBot = () => (
    <Paper p='var(--size-xl)' radius='var(--size-md)' pos='sticky' top={72}>
        <Stack gap='var(--size-sm)'>
            <Title order={5}>Телеграм-бот с вакансиями</Title>
            <Text c='dimmed' size='xs'>
                Получайте первым анонсы и подборки вакансий по вашему направлению.
            </Text>
            <Button
                component={Link}
                target='_blank'
                href='https://t.me/people_flow_bot'
                fullWidth
                leftSection={<TelegramLogo />}
                variant='light'
            >
                Перейти в бота
            </Button>
        </Stack>
    </Paper>
);
