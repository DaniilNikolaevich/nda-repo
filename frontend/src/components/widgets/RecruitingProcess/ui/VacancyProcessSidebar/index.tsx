import { type ChangeEvent, useEffect, useState } from 'react';
import { Flex, Paper, Stack, TextInput } from '@mantine/core';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { skipToken } from '@reduxjs/toolkit/query';
import { isArray } from 'lodash-es';
import { useRouter } from 'next/router';

import { useSelectedVacancy } from '@/components/widgets/RecruitingProcess/model/useSelectedVacancy';
import { useRecruiterFlowsQuery } from '@/services';

import { ProcessUserSelector } from './ProcessUserSelector';

export const VacancyProcessSidebar = () => {
    const {
        query: { id },
    } = useRouter();
    const { filteredProcessModel, selectedProcessUser, processStep, setSelectedProcessUser, setFilteredProcessModel } =
        useSelectedVacancy();
    const { isLoading } = useRecruiterFlowsQuery(!id || isArray(id) ? skipToken : id, {
        refetchOnMountOrArgChange: true,
    });

    const [users, setUsers] = useState(filteredProcessModel);

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;

        if (value === '') {
            return setUsers(filteredProcessModel);
        }

        setUsers?.((prev) => prev?.filter((el) => el.candidate.fullname?.includes(value)));
    };

    const isExistsUsers = users && users.length > 0;
    const isExistsProcessModel = filteredProcessModel && filteredProcessModel.length > 0;

    useEffect(() => {
        if (!filteredProcessModel || (users && users?.length > 0)) return;
        setUsers(filteredProcessModel.filter((el) => el.step.id === processStep));
    }, [filteredProcessModel]);

    useEffect(() => {
        if (!isExistsUsers || !isExistsProcessModel) return;

        setUsers(filteredProcessModel?.filter((el) => el.step.id === processStep));
    }, [processStep, isLoading, filteredProcessModel]);

    useEffect(() => {
        isExistsUsers && setSelectedProcessUser?.(users[0].id);
    }, [users]);

    return (
        <Paper maw={380} w='100%' pb={20} h='72vh' style={{ overflow: 'auto' }}>
            <Stack>
                <Flex align='center' gap='var(--size-sm)'>
                    <TextInput
                        onChange={handleSearch}
                        w='100%'
                        placeholder='ФИО, Телефон, Email'
                        leftSection={<MagnifyingGlass />}
                    />
                    {/*<ActionIcon variant='light' size='lg'>*/}
                    {/*    <ArrowsDownUp weight='bold' />*/}
                    {/*</ActionIcon>*/}
                    {/*<ActionIcon variant='light' size='lg'>*/}
                    {/*    <Funnel weight='bold' />*/}
                    {/*</ActionIcon>*/}
                </Flex>
                <Stack>
                    {users?.map((user) => (
                        <ProcessUserSelector
                            onClick={() => setSelectedProcessUser?.(user.id)}
                            active={user.id === selectedProcessUser}
                            key={user.id}
                            title={user.candidate.fullname}
                            salary={user.candidate.info?.preferred_salary}
                            city={user.candidate.info?.city?.name}
                        />
                    ))}
                </Stack>
            </Stack>
        </Paper>
    );
};
