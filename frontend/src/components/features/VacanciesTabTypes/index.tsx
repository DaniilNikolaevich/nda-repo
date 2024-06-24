import { Group, Tabs, TabsList, Text } from '@mantine/core';
import { Sparkle } from '@phosphor-icons/react/dist/ssr/Sparkle';
import { useUnit } from 'effector-react';
import { useRouter } from 'next/router';

import { $isAuth, $isRecruiter } from '@/services';

export const VacanciesTabTypes = () => {
    const isRecruiter = useUnit($isRecruiter);
    const isAuth = useUnit($isAuth);
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
                <Tabs.Tab hidden={isRecruiter || !isAuth} value='my'>
                    <Group>
                        <Sparkle size={12} />
                        <Text>Персональная AI подборка</Text>
                    </Group>
                </Tabs.Tab>
            </TabsList>
        </Tabs>
    );
};
