import type { ReactNode } from 'react';
import { Title } from '@mantine/core';
import { useRouter } from 'next/router';

import {
    AIProfiles,
    CompanyNewsCabinet,
    ProfileCandidates,
    RecruitingProcess,
    VacanciesBoard,
} from '@/components/widgets';
import { SelectedVacancyContextProvider } from '@/components/widgets/RecruitingProcess/model/useSelectedVacancy';
import { BaseLayout } from '@/layouts';
import { RecruiterTabsLayout } from '@/layouts/RecruiterTabsLayout';
import Calendar from '@/pages/calendar';
import { VacanciesTabTypes } from '@/shared/types';
import { ProtectedRoute } from '@/shared/ui';

import s from './ProcessPage.module.css';

type TabsPagesType = {
    [key in VacanciesTabTypes]?: ReactNode;
};

const TabsPages: TabsPagesType = {
    recruiting: (
        <SelectedVacancyContextProvider>
            <RecruitingProcess />
        </SelectedVacancyContextProvider>
    ),
    vacancies: <VacanciesBoard />,
    calendar: <Calendar />,
    news: <CompanyNewsCabinet />,
    aiProfiles: <AIProfiles />,
    profiles: <ProfileCandidates />,
};

function ProcessPage() {
    const {
        query: { slug },
    } = useRouter();

    return (
        <BaseLayout title='Управление процессом'>
            <ProtectedRoute>
                <section>
                    <Title mb='var(--size-lg)' className={s.title} order={4}>
                        Управление процессом
                    </Title>
                    <RecruiterTabsLayout>{TabsPages[slug as VacanciesTabTypes] as string}</RecruiterTabsLayout>
                </section>
            </ProtectedRoute>
        </BaseLayout>
    );
}

export default ProcessPage;
