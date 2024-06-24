import { Stack } from '@mantine/core';
import { skipToken } from '@reduxjs/toolkit/query';
import { useUnit } from 'effector-react';

import { ResponseCard } from '@/components/entities';
import { $isAuth, $isRecruiter, useGetCandidateRespondedVacanciesQuery } from '@/services';

export const ResponsesList = () => {
    const isAuth = useUnit($isAuth);
    const isRecruiter = useUnit($isRecruiter);
    const { data: responses } = useGetCandidateRespondedVacanciesQuery(!isAuth || isRecruiter ? skipToken : undefined);

    return (
        <Stack gap='var(--size-sm)'>
            {responses?.payload.map((el) => (
                <ResponseCard
                    key={el.id}
                    title={el.position.name}
                    date={el.candidate_response?.response_time ?? ''}
                    id={el.id}
                    chatId={el.chat?.id ?? ''}
                />
            ))}
        </Stack>
    );
};
