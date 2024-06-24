import { Flex, Paper, Skeleton, Stack, Title, useMantineColorScheme } from '@mantine/core';

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
    const { data, totalCount, isLoading, tab } = useGetVacanciesList();

    const showVacanciesCount = totalCount && !isLoading;
    const vacanciesCount = showVacanciesCount
        ? `${getDeclinations({ count: totalCount, few: 'Найдено', many: 'Найдено', one: 'Найдена', withoutCount: true })} ${getDeclinations({ count: totalCount, few: 'вакансий', many: 'вакансий', one: 'вакансия' })}`
        : null;

    const { colorScheme } = useMantineColorScheme();
    const isDarkMode = colorScheme === 'dark';

    return (
        <Paper p='var(--size-xl)' radius='var(--size-md)' bg={isDarkMode ? 'dark.5' : 'white'}>
            <VacanciesTabTypes />
            <Flex gap={60}>
                {tab !== 'my' && <VacanciesAsideFilters />}
                <Stack w='100%' gap={0}>
                    {tab !== 'my' && (
                        <Flex mb='var(--size-lg)' w='100%' h='fit-content' gap='var(--size-sm)'>
                            <EntitySearchBar />
                            <VacanciesSelectType />
                        </Flex>
                    )}

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
                                        actionSlot={
                                            <ApplyForJobButton
                                                {...vacancy}
                                                is_responded={vacancy.candidate_response?.is_responded ?? false}
                                                vacancy_id={vacancy.id}
                                            />
                                        }
                                    />
                                ))}
                            <SendVacancyProposal />
                            {data
                                ?.slice(2)
                                .map((vacancy) => (
                                    <VacancyCard
                                        {...vacancy}
                                        key={vacancy.id}
                                        actionSlot={
                                            <ApplyForJobButton
                                                {...vacancy}
                                                is_responded={vacancy.candidate_response?.is_responded ?? false}
                                                vacancy_id={vacancy.id}
                                            />
                                        }
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
