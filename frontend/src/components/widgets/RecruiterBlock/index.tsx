import { Anchor, Avatar, Button, Flex, Paper, Stack, Text, Title, useMantineColorScheme } from '@mantine/core';

import type { RecruiterModel } from '@/shared/types/common-models';

interface RecruiterBlockProps extends RecruiterModel {}

export const RecruiterBlock = ({
    avatar_thumbnail_url,
    fullname,
    name,
    surname,
    recruiter_info,
}: RecruiterBlockProps) => {
    const { colorScheme } = useMantineColorScheme();
    const isDarkTheme = colorScheme === 'dark';

    return (
        <Paper radius='var(--size-md)' p='var(--size-lg)' bg={isDarkTheme ? 'dark.4' : 'white'}>
            <Title order={5} mb='var(--size-sm)'>
                Контакты рекрутера
            </Title>
            <Flex gap='var(--size-xs)' mb='var(--size-sm)'>
                <Avatar radius='md' src={avatar_thumbnail_url} alt={'Фотография рекрутера ' + fullname} />
                <Stack gap='var(--size-xxs)'>
                    <Text fz={14} lh='18px'>
                        {surname} {name}
                    </Text>
                    <Text fz={12} c='dimmed' lh='16px'>
                        {recruiter_info.position}
                    </Text>
                </Stack>
            </Flex>
            <Stack gap='var(--size-sm)' mb='var(--size-2xl)'>
                <Text fz={12} lh='14px'>
                    Телефон:{' '}
                    <Anchor fz={12} lh='14px' href={`tel:${recruiter_info.phone}`}>
                        {recruiter_info.phone}
                    </Anchor>
                </Text>
                <Text fz={12}>
                    Email:{' '}
                    <Anchor fz={12} href={`mailto:${recruiter_info.email}`}>
                        {recruiter_info.email}
                    </Anchor>
                </Text>
            </Stack>
            <Button fullWidth>Откликнуться</Button>
        </Paper>
    );
};
