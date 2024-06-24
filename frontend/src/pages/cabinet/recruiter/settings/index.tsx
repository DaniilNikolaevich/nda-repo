import { useEffect, useState } from 'react';
import { Center, Flex, Loader, Title } from '@mantine/core';
import { useUnit } from 'effector-react';
import { useRouter } from 'next/router';

import { RecruiterCabinetForm } from '@/components/widgets';
import { BaseLayout } from '@/layouts';
import { $isRecruiter } from '@/services';

import s from './RecruiterPage.module.css';

function SettingsPage() {
    const [blocked, setBlocked] = useState(true);
    const router = useRouter();
    const isRecruiter = useUnit($isRecruiter);

    useEffect(() => {
        if (!isRecruiter) {
            router.push('/');
        } else {
            setBlocked(false);
        }
    }, []);

    if (blocked) {
        return (
            <Center>
                <Loader />
            </Center>
        );
    }

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
