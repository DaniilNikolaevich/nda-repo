import { Flex, Paper, Skeleton, Stack, Title } from '@mantine/core';

import { VacancyCard } from '@/components/entities';
import {
    ApplyForJobButton,
    EntitySearchBar,
    SendVacancyProposal,
    VacanciesAsideFilters,
    VacanciesPagination,
    VacanciesSelectType,
    VacanciesTabTypes,
} from '@/components/features';
import { useGetVacanciesList } from '@/services/VacanciesService/hooks';
import { getDeclinations } from '@/shared/utils';

export const VacanciesBlock = () => {
    const { data, totalCount, isLoading } = useGetVacanciesList();

    const showVacanciesCount = totalCount && !isLoading;
    const vacanciesCount = showVacanciesCount
        ? `${getDeclinations({ count: totalCount, few: 'Найдено', many: 'Найдено', one: 'Найдена', withoutCount: true })} ${getDeclinations({ count: totalCount, few: 'вакансий', many: 'вакансий', one: 'вакансия' })}`
        : null;

    return (
        <Paper p='var(--size-xl)' radius='var(--size-md)'>
            <VacanciesTabTypes />
            <Flex gap={60}>
                <VacanciesAsideFilters />
                <Stack w='100%' gap={0}>
                    <Flex mb='var(--size-lg)' w='100%' h='fit-content' gap='var(--size-sm)'>
                        <EntitySearchBar />
                        <VacanciesSelectType />
                    </Flex>

                    <Title mb='var(--size-lg)' order={4}>
                        {isLoading ? 'Ищем вакансии...' : null}&nbsp;
                        {!isLoading && (
                            <>{Number(totalCount) > 0 ? vacanciesCount : 'По вашему запросу ничего не найдено'}</>
                        )}
                    </Title>
                    <Skeleton visible={isLoading}>
                        <Stack gap='var(--size-xl)'>
                            {data
                                ?.slice(0, 2)
                                .map((vacancy) => (
                                    <VacancyCard
                                        {...vacancy}
                                        key={vacancy.id}
                                        actionSlot={<ApplyForJobButton vacancy_id={vacancy.id} />}
                                    />
                                ))}
                            <SendVacancyProposal />
                            {data
                                ?.slice(2)
                                .map((vacancy) => (
                                    <VacancyCard
                                        {...vacancy}
                                        key={vacancy.id}
                                        actionSlot={<ApplyForJobButton vacancy_id={vacancy.id} />}
                                    />
                                ))}
                        </Stack>
                    </Skeleton>

                    <VacanciesPagination />
                </Stack>
            </Flex>
        </Paper>
    );
};
