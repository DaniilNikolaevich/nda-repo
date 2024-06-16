import { useEffect } from 'react';
import { Button, Flex, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { zodResolver } from 'mantine-form-zod-resolver';

import { useInviteToRecruiterMutation } from '@/services';
import { FormContainer } from '@/shared/ui';
import { AddNewRecruiterSchema } from '@/shared/validate';

import { AddNewRecruiterProvider, useAddNewRecruiterForm } from './model';
import { GeneralInput, InputEmail } from './ui';

export const KanbanAddNewRecruiter = () => {
    const [inviteToRecruiter, { isSuccess, isError }] = useInviteToRecruiterMutation();

    const form = useAddNewRecruiterForm({
        mode: 'uncontrolled',
        name: 'addNewRecruiter-data-form',
        initialValues: {
            name: '',
            patronymic: '',
            surname: '',
            email: '',
        },
        validate: zodResolver(AddNewRecruiterSchema),
    });

    const onSubmit = form.onSubmit((values) => {
        inviteToRecruiter({
            name: values.name,
            surname: values.surname,
            patronymic: values.patronymic,
            email: values.email,
        });
    });

    useEffect(() => {
        if (isError) {
            notifications.show({
                title: 'Произошла ошибка!',
                message: 'Не удалось сохранить данные',
                color: 'red',
            });
        }

        if (isSuccess) {
            notifications.show({
                title: 'Успех!',
                message: 'Данные успешно сохранены',
                color: 'green',
            });
        }
    }, [isSuccess, isError]);

    return (
        <AddNewRecruiterProvider form={form}>
            <FormContainer id='addNewRecruiter-data-form' py={0} px={0} onSubmit={onSubmit}>
                <Flex direction='column' gap={20}>
                    <Text size='sm' fw={400}>
                        Введите данные рекрутера, чтобы отправить приглашение на&nbsp;E-mail.
                    </Text>
                    <GeneralInput name='surname' label='Фамилия' placeholder='Введите фамилию' />
                    <GeneralInput name='name' label='Имя' placeholder='Введите имя' />
                    <GeneralInput name='patronymic' label='Отчетство' placeholder='Введите отчество' />
                    <InputEmail />

                    <Flex justify='flex-end'>
                        <Button type='submit'>Отправить приглашение</Button>
                    </Flex>
                </Flex>
            </FormContainer>
        </AddNewRecruiterProvider>
    );
};
