import React, { useState } from 'react';
import { Container, Flex, Grid, Tabs, Title } from '@mantine/core';

import {
    ContactsForm,
    GenerallyDataForm,
    Newsletter,
    UserEducationForm,
    UserExperienceForm,
} from '@/components/widgets';
import { BaseLayout } from '@/layouts';
import { tabsConfig } from '@/shared/constants';
import { TabTypes } from '@/shared/types';

import s from './SettingsPage.module.css';

type TabsPagesType = {
    [key in TabTypes]?: React.ReactNode;
};

const TabsPages: TabsPagesType = {
    data: <GenerallyDataForm />,
    contacts: <ContactsForm />,
    experience: <UserExperienceForm />,
    education: <UserEducationForm />,
};

function SettingsPage() {
    const [tab, setTab] = useState<TabTypes>('data');

    const handleTabChange = (e: string | null) => {
        setTab(e as TabTypes);
    };

    return (
        <BaseLayout title='Настройки личного кабинета соискателя'>
            <Container miw={1100}>
                <Flex mb={40}>
                    <Title className={s.title} order={4}>
                        Настройки профиля
                    </Title>
                </Flex>
                <Grid gutter='var(--size-lg)' pos='relative'>
                    <Grid.Col
                        span={8}
                        pl={30}
                        pr={30}
                        pb={40}
                        w='fit-content'
                        style={{ borderRadius: '16px', backgroundColor: 'white' }}
                    >
                        <Tabs
                            w='100%'
                            orientation='horizontal'
                            defaultValue={tab}
                            radius='xs'
                            pt={12}
                            pb={12}
                            value={tab}
                            variant='default'
                            onChange={handleTabChange}
                        >
                            <Tabs.List>
                                {tabsConfig.map(({ value, content }) => (
                                    <Tabs.Tab key={value} value={value}>
                                        {content}
                                    </Tabs.Tab>
                                ))}
                            </Tabs.List>
                            {TabsPages[tab]}
                        </Tabs>
                    </Grid.Col>
                    <Grid.Col span={4} pt={0}>
                        <Newsletter />
                    </Grid.Col>
                </Grid>
            </Container>
        </BaseLayout>
    );
}

export default SettingsPage;
