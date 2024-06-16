import { useEffect, useState } from 'react';
import {
    Button,
    Center,
    type ComboboxItem,
    Container,
    Flex,
    Loader,
    Select,
    Stack,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { CaretDown } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { isEmpty, omitBy } from 'lodash-es';

import { CandidateProfileCard } from '@/components/entities';
import { CreateChatWithCandidateButton, InviteApplicantForVacancy } from '@/components/features';
import { useGetAIVacanciesQuery, useGetAllVacanciesForRecruiterQuery, useGetPositionDictionaryQuery } from '@/services';
import { useSelectCandidateForJob } from '@/services/RecruiterService/hooks';
import { CandidateParams } from '@/services/VacanciesService/dto';

export const AIProfiles = () => {
    const [params, setParams] = useState<CandidateParams>({
        sortDesc: 'false',
    });
    const [search, setSearch] = useState('');

    const [vacancyId, setVacancyId] = useState('');

    const { data, isLoading } = useGetAIVacanciesQuery(
        { params: omitBy(params, isEmpty), vacancy_id: vacancyId },
        {
            skip: vacancyId === '',
            refetchOnMountOrArgChange: true,
        }
    );

    const [positionsTypes, setPositionsTypes] = useState<{ label: string; value: string }[]>([]);

    const { data: vacancies } = useGetAllVacanciesForRecruiterQuery(
        {
            status__in: 1,
        },
        {
            refetchOnMountOrArgChange: true,
        }
    );
    const { handleSelectCandidate } = useSelectCandidateForJob();

    const isCandidatesExists = data && data.length > 0 && !isLoading;

    const onVacancyChangeHandler = (value: ComboboxItem) => {
        setVacancyId(value.value);
    };

    const handleSearch = useDebouncedCallback(() => {
        setParams((prev) => ({
            ...prev,
            page: 1,
            search,
        }));
    }, 300);

    useEffect(() => {
        if (!vacancies) return;
        setPositionsTypes(() =>
            vacancies.payload.map((position) => ({
                value: position.id,
                label: position.position.name,
            }))
        );
    }, [vacancies]);

    return (
        <Container>
            <Flex gap={60} py={30}>
                <Stack w='100%' gap='var(--size-lg)' maw={910}>
                    <Title order={3} fz={24}>
                        AI подборка профилей кандидатов на вакансии
                    </Title>
                    <Flex gap='var(--size-sm)'>
                        <Select
                            w={240}
                            rightSection={<CaretDown />}
                            value={vacancyId}
                            data={positionsTypes}
                            placeholder='Выберите вакансию'
                            onChange={(_, option) => onVacancyChangeHandler(option)}
                        />
                        <TextInput
                            onChange={(e) => {
                                setSearch(e.target.value);
                                handleSearch();
                            }}
                            value={search}
                            w='100%'
                            leftSection={<MagnifyingGlass size={20} />}
                            placeholder='Найти кандидата'
                        />
                    </Flex>
                    {data?.map((candidate) => (
                        <CandidateProfileCard
                            key={candidate.id}
                            {...candidate}
                            actionSlot={
                                <>
                                    <InviteApplicantForVacancy
                                        candidate_id={candidate?.user?.id ?? ''}
                                        vacancies={vacancies?.payload}
                                        onSelect={handleSelectCandidate}
                                    />
                                    <CreateChatWithCandidateButton id={candidate?.user?.id} />
                                </>
                            }
                        />
                    ))}
                    {!isCandidatesExists && (
                        <Stack>
                            <Text fz={20} fw={600}>
                                По вашему запросу ничего не найдено
                            </Text>
                        </Stack>
                    )}
                    {isLoading && (
                        <Center>
                            <Loader />
                        </Center>
                    )}
                </Stack>
            </Flex>
        </Container>
    );
};
