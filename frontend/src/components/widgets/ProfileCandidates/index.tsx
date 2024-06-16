import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Center,
    type ComboboxItem,
    Flex,
    Loader,
    Pagination,
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
import { useCitiesList } from '@/components/features/VacanciesAsideFilters/VacanciesRegionFilter/model';
import { useSelectCandidateForJob } from '@/services/RecruiterService/hooks';
import { useGetAllCandidatesQuery, useGetAllVacanciesForRecruiterQuery } from '@/services/VacanciesService';
import type { CandidateParams } from '@/services/VacanciesService/dto';
import { useGetCities } from '@/shared/hooks';

import { RegionFilter } from './ui/RegionFilter';
import { SalaryFilter } from './ui/SalaryFilter';

const TYPES = [
    {
        value: 'false',
        label: 'Сначала новые',
    },
    {
        value: 'true',
        label: 'Сначала старые',
    },
];

export const ProfileCandidates = () => {
    const [params, setParams] = useState<CandidateParams>({
        sortDesc: TYPES[0].value,
    });
    const [search, setSearch] = useState('');
    const [salary, setSalary] = useState('');
    const [region, setRegion] = useState<string[]>([]);

    const { data, isLoading } = useGetAllCandidatesQuery(omitBy(params, isEmpty));
    const { data: vacancies } = useGetAllVacanciesForRecruiterQuery(
        {
            status__in: 1,
        },
        {
            refetchOnMountOrArgChange: true,
        }
    );
    const { handleSelectCandidate } = useSelectCandidateForJob();

    const isCandidatesExists = data?.payload && data?.payload.length > 0 && !isLoading;
    const { moscow, spb } = useGetCities();
    const [additionalCities] = useCitiesList();

    const onDescChange = (value: ComboboxItem) => {
        setParams((prev) => ({ ...prev, sortDesc: String(value.value) }));
    };

    const handleSearch = useDebouncedCallback(() => {
        setParams((prev) => ({
            ...prev,
            page: 1,
            search,
        }));
    }, 300);

    const handleSalaryChange = (value: string) => {
        setSalary(value);
        if (value === '') {
            return setParams((prev) => ({ ...prev, preferred_salary__gte: '', preferred_salary__isnull: '' }));
        }
        if (value === '$exists') {
            return setParams((prev) => ({ ...prev, preferred_salary__gte: '', preferred_salary__isnull: 'false' }));
        }
        return setParams((prev) => ({ ...prev, preferred_salary__gte: value, preferred_salary__isnull: 'false' }));
    };

    const handleRegionChange = (value: string[]) => {
        setRegion(value);
    };

    useEffect(() => {
        setParams((prev) => ({ ...prev, city__in: region.join(',') }));
    }, [region]);

    useEffect(() => {
        if (!moscow || !spb) return;
        setRegion([moscow.id, spb.id]);
    }, [moscow, spb]);

    useEffect(() => {
        setRegion((prev) => [...prev, ...(additionalCities?.map((el) => el.id) ?? [])]);
    }, [additionalCities]);

    return (
        <Flex gap={60} py={30}>
            <Stack gap='var(--size-5xl)' p='var(--size-xs)' maw={280} w='100%' component='aside'>
                <SalaryFilter value={salary} onChange={handleSalaryChange} />
                <RegionFilter value={region} onChange={handleRegionChange} />
                <Button
                    w='fit-content'
                    variant='subtle'
                    onClick={() => {
                        setParams({
                            sortDesc: 'false',
                        });
                        setRegion([]);
                        setSalary('');
                        setSearch('');
                    }}
                >
                    Сбросить все
                </Button>
            </Stack>
            <Stack w='100%' gap='var(--size-lg)' maw={910}>
                <Title order={3} fz={24}>
                    Все профили кандидатов
                </Title>
                <Flex gap='var(--size-sm)'>
                    <Select
                        w={240}
                        rightSection={<CaretDown />}
                        value={params.sortDesc?.toString()}
                        data={TYPES}
                        onChange={(_, option) => onDescChange(option)}
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
                {data?.payload.map((candidate) => (
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
                <Pagination
                    hidden={!isCandidatesExists}
                    onChange={(page) => setParams((prev) => ({ ...prev, page }))}
                    total={data?.total_pages ?? 1}
                />
            </Stack>
        </Flex>
    );
};
