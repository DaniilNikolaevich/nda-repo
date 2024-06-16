import { Tabs, TabsList } from '@mantine/core';
import { useRouter } from 'next/router';

export const VacanciesTabTypes = () => {
    const router = useRouter();

    return (
        <Tabs
            mb='var(--size-xl)'
            defaultValue='all'
            value={router.query.activeTab as string}
            onChange={(value) => router.push(`?activeTab=${value}`)}
        >
            <TabsList>
                <Tabs.Tab value='all'>Все вакансии</Tabs.Tab>
                {/*<Tabs.Tab value='my'>Подходящие</Tabs.Tab>*/}
            </TabsList>
        </Tabs>
    );
};
