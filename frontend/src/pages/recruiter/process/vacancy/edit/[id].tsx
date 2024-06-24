import React, { useState } from 'react';
import { Flex, Grid, Tabs, Title } from '@mantine/core';

import { VacancyForm } from '@/components/widgets';
import { BaseLayout } from '@/layouts';

import s from './VacancyCreatePage.module.css';

function EditPage() {
    return (
        <BaseLayout title='Редактирование вакансии'>
            <div className={s.root}>
                <Flex direction='column'>
                    <Flex mb={40}>
                        <Title className={s.title} order={4}>
                            Редактирование вакансии
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

export default EditPage;
