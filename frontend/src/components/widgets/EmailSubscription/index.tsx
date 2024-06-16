import { useEffect } from 'react';
import { Button, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { Envelope } from '@phosphor-icons/react/dist/ssr/Envelope';

import { useEmailSubscribeMutation } from '@/services/SubscriptionService';

export const EmailSubscription = () => {
    const [subscribe, { isLoading, isSuccess, isError }] = useEmailSubscribeMutation();
    const form = useForm<{ email: string }>({
        mode: 'uncontrolled',
        initialValues: {
            email: '',
        },
        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Неверный email'),
        },
    });

    const emailProps = form.getInputProps('email');

    const onSubmit = form.onSubmit((values) => {
        subscribe(values).unwrap();
    });

    useEffect(() => {
        if (!isSuccess) return;
        notifications.show({
            title: 'Успешно!',
            message: 'Вы успешно подписаны на рассылку!',
        });
        form.reset();
    }, [isSuccess]);

    useEffect(() => {
        if (isError) {
            notifications.show({
                title: 'Ошибка!',
                message: 'Увы, что-то пошло не так :(',
                color: 'red',
            });
        }
    }, [isError]);

    return (
        <Paper p='var(--size-xl)' radius='var(--size-md)' pos='sticky' top={72}>
            <form onSubmit={onSubmit}>
                <Stack gap='var(--size-sm)'>
                    <Title order={5}>Подписаться на рассылку</Title>
                    <TextInput placeholder='Укажите e-mail' key={form.key('email')} {...emailProps} />
                    <Text size='xs'>Мы будем присылать вам информация о новых вакансиях и жизни компании</Text>
                    <Button loading={isLoading} type='submit' fullWidth leftSection={<Envelope />} variant='light'>
                        Подписаться
                    </Button>
                </Stack>
            </form>
        </Paper>
    );
};
