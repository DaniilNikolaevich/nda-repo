import { type ReactNode, useState } from 'react';
import { Container, Flex, Tabs, Title } from '@mantine/core';

import {
    ContactsForm,
    GenerallyDataForm,
    Newsletter,
    UserEducationForm,
    UserExperienceForm,
} from '@/components/widgets';
import { BaseLayout } from '@/layouts';
import { tabsConfig } from '@/shared/constants';
import { useIsLaptop } from '@/shared/hooks/media';
import type { TabTypes } from '@/shared/types';

import s from './SettingsPage.module.css';

type TabsPagesType = {
    [key in TabTypes]?: ReactNode;
};

const TabsPages: TabsPagesType = {
    data: <GenerallyDataForm />,
    contacts: <ContactsForm />,
    experience: <UserExperienceForm />,
    education: <UserEducationForm />,
};

function SettingsPage() {
    const isDesktop = useIsLaptop();
    const [tab, setTab] = useState<TabTypes>('data');

    const handleTabChange = (e: string | null) => {
        setTab(e as TabTypes);
    };

    return (
        <BaseLayout title='Настройки личного кабинета соискателя'>
            <Container>
                <Flex mb={40}>
                    <Title className={s.title} order={4}>
                        Настройки профиля
                    </Title>
                </Flex>
                <Flex gap='var(--size-lg)' direction={isDesktop ? 'row-reverse' : 'column'} pos='relative'>
                    <Newsletter />

                    <Tabs
                        bg='var(--mantine-color-white)'
                        w='100%'
                        orientation='horizontal'
                        defaultValue={tab}
                        value={tab}
                        variant='default'
                        onChange={handleTabChange}
                        style={{ borderRadius: 'var(--size-md)' }}
                    >
                        <Tabs.List>
                            {tabsConfig.map(({ value, content }) => (
                                <Tabs.Tab py='var(--size-lg)' key={value} value={value}>
                                    {content}
                                </Tabs.Tab>
                            ))}
                        </Tabs.List>
                        {TabsPages[tab]}
                    </Tabs>
                </Flex>
            </Container>
        </BaseLayout>
    );
}

export default SettingsPage;
