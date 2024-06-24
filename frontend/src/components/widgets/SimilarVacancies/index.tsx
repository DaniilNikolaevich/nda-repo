import { Stack, Title } from '@mantine/core';
import { skipToken } from '@reduxjs/toolkit/query';
import { isArray } from 'lodash-es';
import { useRouter } from 'next/router';

import { VacancyCard } from '@/components/entities';
import { useGetSimilarVacanciesQuery } from '@/services';

export const SimilarVacancies = () => {
    const {
        query: { id },
    } = useRouter();

    const isCorrectId = id && !isArray(id);

    const { data: similarVacancies } = useGetSimilarVacanciesQuery(isCorrectId ? id : skipToken);

    if (!similarVacancies) return null;

    return (
        <Stack>
            <Title my={20} fz={24}>
                Похожие вакансии ({similarVacancies.length})
            </Title>
            {similarVacancies?.map((vacancy) => <VacancyCard key={vacancy.id} {...vacancy} />)}
        </Stack>
    );
};
