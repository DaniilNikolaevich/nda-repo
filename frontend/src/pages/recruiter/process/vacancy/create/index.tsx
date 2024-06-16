import React, { useState } from 'react';
import { Container, Flex, Grid, Tabs, Title } from '@mantine/core';

import {
    ContactsForm,
    GenerallyDataForm,
    Newsletter,
    RecruiterCabinetForm,
    UserEducationForm,
    UserExperienceForm,
    VacancyForm,
} from '@/components/widgets';
import { BaseLayout } from '@/layouts';
import { tabsConfig } from '@/shared/constants';

import s from './VacancyCreatePage.module.css';

function CreatePage() {
    return (
        <BaseLayout title='Создание новой вакансии'>
            <div className={s.root}>
                <Flex direction='column'>
                    <Flex mb={40}>
                        <Title className={s.title} order={4}>
                            Новая вакансия
                        </Title>
                    </Flex>
                    <Flex gap={20}>
                        <Flex
                            pl={30}
                            pr={30}
                            pb={40}
                            w='fit-content'
                            style={{ borderRadius: '16px', backgroundColor: 'white' }}
                        >
                            <VacancyForm />
                        </Flex>
                    </Flex>
                </Flex>
            </div>
        </BaseLayout>
    );
}

export default CreatePage;
