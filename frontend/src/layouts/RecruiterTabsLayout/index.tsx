import type { PropsWithChildren } from 'react';
import { Paper, Tabs } from '@mantine/core';
import { useRouter } from 'next/router';

import { useGetAllVacanciesForRecruiterQuery } from '@/services/VacanciesService';
import { vacanciesTabsConfig } from '@/shared/constants/vacancies';

export function RecruiterTabsLayout({ children }: PropsWithChildren) {
    const router = useRouter();

    const { data } = useGetAllVacanciesForRecruiterQuery({
        status__in: 1,
    });
    const handleTabChange = async (slug: string | null) => {
        await router.push({
            pathname: `/recruiter/process/${slug}`,
            query: slug === 'recruiting' ? { id: data?.payload[0].id } : '',
        });
    };

    return (
        <Paper radius='var(--size-md)' w='100%' px={30}>
            <Tabs
                orientation='horizontal'
                radius='xs'
                pt={12}
                pb={12}
                value={router.query.slug as string}
                variant='default'
                onChange={handleTabChange}
            >
                <Tabs.List>
                    {vacanciesTabsConfig.map(({ disabled, value, content, withQuery }) => (
                        <Tabs.Tab disabled={disabled} key={value} value={value}>
                            {content}
                        </Tabs.Tab>
                    ))}
                </Tabs.List>
                {children}
            </Tabs>
        </Paper>
    );
}
