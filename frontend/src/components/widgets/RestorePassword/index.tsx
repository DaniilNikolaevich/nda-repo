import { useEffect, useState } from 'react';
import { Button, PasswordInput, Title, useMantineColorScheme } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { zodResolver } from 'mantine-form-zod-resolver';
import { redirect, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';

import { useResetPasswordConfirmationMutation, useSetPasswordMutation } from '@/services';
import { FormContainer } from '@/shared/ui';
import { handleError } from '@/shared/utils';
import { RestorePasswordSchema } from '@/shared/validate';

import { RestorePasswordFormProvider, useRestorePasswordForm } from './model/useRestorePasswordForm';

export const RestorePassword = ({ title = 'Смена пароля', isReset = false }: { isReset?: boolean; title?: string }) => {
    const { colorScheme } = useMantineColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isVisiblePassword, setIsVisiblePassword] = useState(false);
    const form = useRestorePasswordForm({
        validate: zodResolver(RestorePasswordSchema),
        initialValues: {
            password_confirm: '',
            password: '',
        },
    });

    const [setInitialPassword, { isSuccess, data, isLoading }] = useSetPasswordMutation();
    const [
        setNewPassword,
        { isSuccess: isNewPasswordSuccess, isLoading: isNewPasswordLoading, data: newPasswordData },
    ] = useResetPasswordConfirmationMutation();

    const verification_code = searchParams.get('verification_code');

    const [background, setBackground] = useState('dark.4');

    const onSubmit = form.onSubmit(async (values) => {
        if (!verification_code) {
            return notifications.show({
                title: 'Произошла ошибка!',
                message: 'Отсутствует проверочный код',
            });
        }

        try {
            if (isReset) {
                await setNewPassword({
                    ...values,
                    verification_code,
                }).unwrap();
                return;
            }

            await setInitialPassword({
                ...values,
                verification_code,
            }).unwrap();
        } catch (e) {
            handleError(e);
        }
    });

    useEffect(() => {
        if (isSuccess || isNewPasswordSuccess) {
            notifications.show({
                title: 'Успешно!',
                message: (data ?? newPasswordData)?.message,
            });
            router.push('/auth');
        }
    }, [isSuccess, isNewPasswordSuccess]);

    useEffect(() => {
        if (isDarkMode) {
            return setBackground('dark.4');
        }

        setBackground('white');
    }, []);

    return (
        <RestorePasswordFormProvider form={form}>
            <FormContainer maw={500} centered onSubmit={onSubmit}>
                <Title order={2}>{title}</Title>
                <PasswordInput
                    visible={isVisiblePassword}
                    onVisibilityChange={setIsVisiblePassword}
                    label='Новый пароль'
                    placeholder='от 8 символов'
                    key={form.key('password')}
                    {...form.getInputProps('password')}
                />
                <PasswordInput
                    visible={isVisiblePassword}
                    onVisibilityChange={setIsVisiblePassword}
                    label='Пароль ещё раз'
                    placeholder='Повторите пароль'
                    key={form.key('password_confirm')}
                    {...form.getInputProps('password_confirm')}
                />
                <Button loading={isLoading || isNewPasswordLoading} type='submit'>
                    Сохранить
                </Button>
            </FormContainer>
        </RestorePasswordFormProvider>
    );
};
