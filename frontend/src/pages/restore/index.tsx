import { useEffect } from 'react';
import { Anchor, Button, Flex, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';

import { BaseLayout } from '@/layouts';
import { useResetPasswordMutation } from '@/services';
import { FormContainer } from '@/shared/ui';
import { handleError } from '@/shared/utils';

function RestorePage() {
    const [resetPassword, { isSuccess, data }] = useResetPasswordMutation();
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            email: '',
        },

        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Неверный email'),
        },
    });

    const onSubmit = form.onSubmit(async (values) => {
        try {
            await resetPassword(values).unwrap();
        } catch (e: unknown) {
            handleError(e);
        }
    });

    useEffect(() => {
        if (isSuccess) {
            notifications.show({
                message: `На почту ${form.getValues().email} отправлено письмо для восстановления пароля. Перейдите по ссылке из письма, чтобы создать новый пароль.`,
            });
        }
    }, [isSuccess]);

    return (
        <BaseLayout title='Восстановление пароля'>
            <FormContainer centered maw={500} onSubmit={onSubmit}>
                <Title order={2}>Восстановление пароля</Title>
                <TextInput
                    label='E-mail'
                    placeholder='example@hotmail.com'
                    key={form.key('email')}
                    {...form.getInputProps('email')}
                />
                <Button fullWidth type='submit'>
                    Отправить
                </Button>
                <Flex align='center' justify='center'>
                    <Anchor component={Link} href='/auth' variant='subtle'>
                        Войти
                    </Anchor>
                    &nbsp;или&nbsp;
                    <Anchor component={Link} href='/registration' variant='subtle'>
                        зарегистрироваться
                    </Anchor>
                </Flex>
            </FormContainer>
        </BaseLayout>
    );
}

export default RestorePage;
