import { Flex, List, NumberFormatter, Paper, Pill, PillGroup, Stack, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';

import type { VacancyModel } from '@/shared/types/common-models';

interface FullVacancyCardProps extends VacancyModel {}

export const FullVacancyCard = ({
    position,
    created_at,
    salary,
    city,
    description,
    work_schedule,
    employment_type,
    skills,
    tasks,
    benefits,
}: FullVacancyCardProps) => (
    <Paper p='var(--size-lg)' radius='var(--size-lg)'>
        <Stack gap='var(--size-lg)'>
            <Flex justify='space-between' align='center'>
                <Title fz={24}>{position.name}</Title>
                <Text fz={14}>Опубликована {dayjs(created_at).format('D MMMM YYYY')}</Text>
            </Flex>
            <Text fw={600} fz={20}>
                <NumberFormatter thousandSeparator=' ' suffix=' ₽' value={salary} />
            </Text>
            <Text>{city.name}</Text>
            <PillGroup>
                <Pill>{work_schedule?.name}</Pill>
                <Pill>{employment_type?.name}</Pill>
            </PillGroup>
            <Text>{description}</Text>
            <Flex direction='column' gap='var(--size-lg)'>
                <Stack hidden={!skills} gap='var(--size-xs)'>
                    <Title fz={16} order={4}>
                        Требуемые знания и навыки
                    </Title>
                    <List>
                        {skills?.map((skill) => (
                            <List.Item fz={14} key={skill.id}>
                                {skill.name}
                            </List.Item>
                        ))}
                    </List>
                </Stack>
                <Stack hidden={!tasks} gap='var(--size-xs)'>
                    <Title fz={16} order={4}>
                        Задачи
                    </Title>
                    <Text fz={14}>{tasks}</Text>
                </Stack>
                <Stack hidden={!benefits} gap='var(--size-xs)'>
                    <Title fz={16} order={4}>
                        Мы предлагаем
                    </Title>
                    <Text fz={14}>{benefits}</Text>
                </Stack>
            </Flex>
        </Stack>
    </Paper>
);
