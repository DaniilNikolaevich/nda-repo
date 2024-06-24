import { type MouseEvent, useEffect } from 'react';
import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useUnit } from 'effector-react';
import Link from 'next/link';

import { $isAuth, $isRecruiter, useApplyForJobMutation } from '@/services';
import { isErrorWithMessage } from '@/shared/types';

export const ApplyForJobButton = ({ vacancy_id, is_responded }: { vacancy_id: string; is_responded: boolean }) => {
    const isAuth = useUnit($isAuth);
    const isRecruiter = useUnit($isRecruiter);
    const [applyForJob, { isLoading, isSuccess, isError, error }] = useApplyForJobMutation();

    const onApplyForJobHandler = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            applyForJob({
                vacancy: vacancy_id,
            }).unwrap();
        } catch (e) {
            if (e instanceof Error) {
                console.error(e.message);
            }

            notifications.show({
                color: 'red',
                title: 'Ошибка!',
                message: 'Что-то пошло не так...',
            });
        }
    };

    useEffect(() => {
        if (!isSuccess) return;
        notifications.show({
            title: 'Успешно!',
            message: 'В течение нескольких дней мы с вами свяжемся',
        });
    }, [isSuccess]);

    useEffect(() => {
        if (!isError) return;
        notifications.show({
            color: 'red',
            title: 'Ошибка!',
            message: isErrorWithMessage(error) ? error.message : 'Что-то пошло не так',
        });
    }, [isError]);

    if (isRecruiter) return null;

    if (!isAuth) {
        return (
            <Button w='fit-content' component={Link} href='/auth'>
                Войти и откликнуться
            </Button>
        );
    }

    if (is_responded) {
        return (
            <Button w='fit-content' variant='light' component={Link} href='/responses'>
                Вы уже откликнулись
            </Button>
        );
    }

    return (
        <Button w='fit-content' onClick={onApplyForJobHandler} loading={isLoading}>
            Откликнуться
        </Button>
    );
};
