import type { ReactNode } from 'react';
import {
    Flex,
    NumberFormatter,
    Paper,
    Pill,
    PillGroup,
    Stack,
    Text,
    Title,
    useMantineColorScheme,
} from '@mantine/core';
import dayjs from 'dayjs';
import Link from 'next/link';

import type { VacancyModel } from '@/shared/types/common-models';

import s from './VacancyCard.module.css';

interface VacancyCardProps extends VacancyModel {
    actionSlot?: ReactNode;
}

export const VacancyCard = ({
    id,
    position,
    created_at,
    salary,
    city,
    work_schedule,
    employment_type,
    description,
    actionSlot,
}: VacancyCardProps) => {
    const { colorScheme } = useMantineColorScheme();
    const isDarkTheme = colorScheme === 'dark';

    return (
        <Paper
            className={s.root}
            component={Link}
            href={`/vacancy/${id}`}
            withBorder
            bg={isDarkTheme ? 'dark.4' : 'white'}
        >
            <Flex component='header' align='center' justify='space-between' gap='var(--size-sm)' mb='var(--size-sm)'>
                <Title className={s.title} order={3}>
                    {position.name}
                </Title>
                <Text>{dayjs(created_at).format('D MMMM YYYY')}</Text>
            </Flex>
            <Stack gap='var(--size-sm)'>
                <Text fz={18}>
                    <NumberFormatter value={salary} thousandSeparator=' ' suffix=' ₽' />
                </Text>
                <Text fz={14}>{city.name}</Text>
                <PillGroup>
                    <Pill>{work_schedule?.name}</Pill>
                    <Pill>{employment_type?.name}</Pill>
                </PillGroup>
                <Stack gap='var(--size-xs)'>
                    <Text fw={600}>Задачи:</Text>
                    <Text fz={14} lineClamp={2}>
                        {description}
                    </Text>
                </Stack>
                {actionSlot}
            </Stack>
        </Paper>
    );
};
