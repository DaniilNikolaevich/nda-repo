import { Group, Paper, Stack, Text } from '@mantine/core';
import { ClockCounterClockwise } from '@phosphor-icons/react';
import { skipToken } from '@reduxjs/toolkit/query';
import dayjs from 'dayjs';

import { useSelectedVacancy } from '@/components/widgets/RecruitingProcess/model/useSelectedVacancy';
import { useGetCandidateHistoryFlowQuery } from '@/services';

export const History = () => {
    const { selectedProcessUser } = useSelectedVacancy();
    const { data: history } = useGetCandidateHistoryFlowQuery(selectedProcessUser ?? skipToken);

    console.log(selectedProcessUser);

    return (
        <Paper>
            <Stack>
                <Group gap='var(--size-xs)'>
                    <ClockCounterClockwise weight='bold' size={20} />
                    <Text fw='600' fz={18}>
                        История активности
                    </Text>
                </Group>
                <Stack>
                    {history?.map((el) => (
                        <Stack key={el.id} gap='var(--size-xxs)'>
                            <Text c='dimmed' fz={12}>
                                {dayjs(el.created_at).format('DD.MM.YYYY HH:mm')}
                            </Text>
                            <Text fz={14}>{el.message}</Text>
                        </Stack>
                    ))}
                </Stack>
            </Stack>
        </Paper>
    );
};
