import React from 'react';
import { Flex, Title } from '@mantine/core';

import { RecruiterCabinetForm } from '@/components/widgets';
import { BaseLayout } from '@/layouts';
import { useGetInfoRecruiterByMeQuery } from '@/services';

import s from './RecruiterPage.module.css';

function SettingsPage() {
    return (
        <BaseLayout title='Личный кабинет рекрутера'>
            <div className={s.root}>
                <Flex direction='column'>
                    <Flex mb={40}>
                        <Title className={s.title} order={4}>
                            Настройки профиля
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
                            <RecruiterCabinetForm />
                        </Flex>
                    </Flex>
                </Flex>
            </div>
        </BaseLayout>
    );
}

export default SettingsPage;
