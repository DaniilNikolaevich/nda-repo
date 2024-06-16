import { useEffect } from 'react';
import { Box, Flex, Loader, Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { zodResolver } from 'mantine-form-zod-resolver';

import { UploadCropAvatar } from '@/components/entities';
import { CabinetLayout } from '@/layouts';
import {
    useChangeAdditionalInfoRecruiterByMeMutation,
    useChangeMainInfoRecruiterByMeMutation,
    useCreateTemplateMessageMutation,
    useGetInfoRecruiterByMeQuery,
    useGetTemplateMessagesQuery,
} from '@/services';
import { FormContainer } from '@/shared/ui';
import { RecruiterCabinetSchema } from '@/shared/validate';

import { RecruiterCabinetFormProvider, useRecruiterCabinetForm } from './model';
import { Controls, FormCategoryName, GeneralInput, GeneralTextArea, InputEmail, PhoneInput } from './ui';

export const RecruiterCabinetForm = () => {
    const { data: recruiterInfo, isLoading: isFetchingInfo } = useGetInfoRecruiterByMeQuery();
    const [changeAdditionalInfo, { isSuccess: isSuccessAddInfo, isError: isErrorAddInfo }] =
        useChangeAdditionalInfoRecruiterByMeMutation();
    const [changeMainInfo, { isSuccess: isSuccessMainInfo, isError: isErrorMainInfo }] =
        useChangeMainInfoRecruiterByMeMutation();
    const { data: defaultMessages } = useGetTemplateMessagesQuery();
    const [createTemplateMessage] = useCreateTemplateMessageMutation();

    const form = useRecruiterCabinetForm({
        mode: 'uncontrolled',
        name: 'recruiter-cabinet-form',
        initialValues: {
            name: '',
            patronymic: '',
            surname: '',
            phone: '',
            email: null,
            position: '',
            department: '',
            message: '',
        },
        validate: zodResolver(RecruiterCabinetSchema),
    });

    useEffect(() => {
        if (recruiterInfo) {
            form.initialize({
                department: recruiterInfo.department,
                email: recruiterInfo.email,
                name: recruiterInfo.user?.name,
                patronymic: recruiterInfo.user?.patronymic,
                phone: recruiterInfo.phone,
                position: recruiterInfo.position,
                surname: recruiterInfo.user?.surname,
                message: defaultMessages?.[0]?.message ?? '',
            });
        }
    }, [recruiterInfo, defaultMessages]);

    const onSubmit = form.onSubmit((values) => {
        changeMainInfo({
            patronymic: values.patronymic ?? '',
            name: values.name ?? '',
            surname: values.surname ?? '',
        });
        changeAdditionalInfo({
            department: values.department ?? '',
            email: values.email ?? '',
            phone: values.phone ?? '',
            position: values.position ?? '',
        });
        createTemplateMessage({
            message: values?.message ?? '',
        });
    });

    useEffect(() => {
        if (isErrorAddInfo || isErrorMainInfo) {
            notifications.show({
                title: 'Произошла ошибка!',
                message: 'Не удалось сохранить данные',
                color: 'red',
            });
        }

        if (isSuccessAddInfo || isSuccessMainInfo) {
            notifications.show({
                title: 'Успех!',
                message: 'Данные успешно сохранены',
                color: 'green',
            });
        }
    }, [isSuccessAddInfo, isErrorAddInfo, isSuccessMainInfo, isErrorMainInfo]);

    if (isFetchingInfo) {
        return (
            <Flex p={40} align='flex-end' justify='center'>
                <Loader />
            </Flex>
        );
    }

    return (
        <CabinetLayout>
            <RecruiterCabinetFormProvider form={form}>
                <FormContainer px={0} py={0} id='generally-data-form' onSubmit={onSubmit}>
                    <Flex justify='space-between' style={{ minWidth: 730 }} pt={40}>
                        <Box w={420}>
                            <FormCategoryName title='Профиль' />
                            <Flex direction='column' gap='xl'>
                                <GeneralInput name='name' label='Имя' placeholder='Введите имя' />
                                <GeneralInput name='patronymic' label='Отчетство' placeholder='Введите отчество' />
                                <GeneralInput name='surname' label='Фамилия' placeholder='Введите фамилию' />
                                <InputEmail />
                                <PhoneInput name='phone' label='Мобильный телефон' placeholder='Введите телефон' />
                                <GeneralInput name='position' label='Должность' placeholder='Введите должность' />
                                <GeneralInput
                                    name='department'
                                    label='Подразделение'
                                    placeholder='Введите подразделение'
                                />
                                <GeneralTextArea
                                    label='Шаблон приветствия в чате'
                                    placeholder='Напишите текст для автоматического сообщения при создании чата'
                                    name='message'
                                />
                                <Controls />
                            </Flex>
                        </Box>
                        <UploadCropAvatar avatarUrl={recruiterInfo?.avatar_url} />
                    </Flex>
                </FormContainer>
            </RecruiterCabinetFormProvider>
        </CabinetLayout>
    );
};
