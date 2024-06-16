import { useEffect, useState } from 'react';
import { Button, Flex, Loader } from '@mantine/core';
import { randomId, useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';
import dayjs from 'dayjs';
import { zodResolver } from 'mantine-form-zod-resolver';

import { CabinetLayout } from '@/layouts';
import {
    useChangeEducationInfoMutation,
    useGetEducationalEstablishmentsDictionaryQuery,
    useGetEducationalLevelsDictionaryQuery,
    useGetEducationByMeQuery,
} from '@/services';
import { FormContainer } from '@/shared/ui';
import { UserEducationSchema } from '@/shared/validate';

import { UserEducationFormProvider, useUserEducationForm } from './model';
import { Controls, FormCategoryName, GeneralDateInput, GeneralInput, SelectInput } from './ui';
import s from './UserEducationForm.module.css';

export const UserEducationForm = () => {
    const form = useUserEducationForm({
        mode: 'uncontrolled',
        name: 'user-education-form',
        initialValues: {
            education: [
                {
                    institution: { name: null, value: null, label: null, key: randomId() },
                    start_date: { name: null, key: randomId() },
                    end_date: { name: null, key: randomId() },
                    faculty: { name: null, value: null, label: null, key: randomId() },
                    speciality: { name: null, value: null, label: null, key: randomId() },
                    education_level: { name: null, value: null, label: null, key: randomId() },
                },
            ],
        },
        validate: zodResolver(UserEducationSchema),
    });

    const [organizationsNameValue, setOrganizationsNameValue] = useState<string>('');
    const [educationLevelsValue, setEducationLevelsValue] = useState<string>('');

    const [debouncedOrganizationsNameValue] = useDebouncedValue(organizationsNameValue, 1000);
    const [debouncedEducationLevelsValue] = useDebouncedValue(educationLevelsValue, 1000);

    const { data, isLoading: isFetchingInfo } = useGetEducationByMeQuery();
    const { data: organizationsName, isLoading: isFetchingOrgsName } = useGetEducationalEstablishmentsDictionaryQuery({
        page: 1,
        itemsPerPage: 200,
        search: debouncedOrganizationsNameValue,
    });
    const { data: educationLevels, isLoading: isFetchingEduLevels } = useGetEducationalLevelsDictionaryQuery({
        page: 1,
        itemsPerPage: 200,
        search: debouncedEducationLevelsValue,
    });
    const [changeEducationMeInfo, { isError, isSuccess }] = useChangeEducationInfoMutation();

    useEffect(() => {
        if (data) {
            form.initialize({
                education: data.map(({ institution, start_date, faculty, speciality, education_level, end_date }) => ({
                    institution: {
                        name: institution.name ?? '',
                        value: institution.name ?? '',
                        label: institution.name ?? '',
                        key: randomId(),
                    },
                    start_date: { name: start_date ? new Date(start_date) : null, key: randomId() },
                    end_date: { name: end_date ? new Date(end_date) : null, key: randomId() },
                    faculty: { value: faculty, label: faculty, name: faculty ?? '', key: randomId() },
                    speciality: { value: speciality, label: speciality, name: speciality ?? '', key: randomId() },
                    education_level: {
                        name: education_level.name ?? '',
                        label: education_level.name ?? '',
                        value: String(education_level.id) ?? '',
                        key: randomId(),
                    },
                })),
            });
        }
    }, [data]);

    const onSubmit = form.onSubmit((values) => {
        changeEducationMeInfo(
            values?.education?.map(({ institution, start_date, end_date, faculty, speciality, education_level }) => ({
                institution: institution?.value ?? null,
                start_date: start_date?.name ? dayjs(start_date?.name).format('YYYY-MM-DD') : null,
                end_date: end_date?.name ? dayjs(end_date?.name).format('YYYY-MM-DD') : null,
                faculty: faculty.name ?? null,
                speciality: speciality.name ?? null,
                education_level: education_level.value ? Number(education_level.value) : null,
            }))
        );
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

    const isFetching = isFetchingOrgsName || isFetchingEduLevels || isFetchingInfo;

    if (isFetching) {
        return (
            <Flex p={40} align='flex-end' justify='center'>
                <Loader />
            </Flex>
        );
    }

    const fields = form.getValues().education.map((item, index) => (
        <Flex key={index} direction='column' gap='xl'>
            <SelectInput
                index={index}
                data={
                    organizationsName?.payload?.map(({ id, name }) => ({
                        value: name,
                        label: name,
                    })) ?? []
                }
                onSearch={(searchValue) => setOrganizationsNameValue(searchValue)}
                placeholder='Выберите из списка'
                name='institution'
                label='Название организации'
            />
            <GeneralDateInput index={index} placeholder='Выберите дату' name='start_date' label='Дата начала' />
            <GeneralDateInput index={index} placeholder='Выберите дату' name='end_date' label='Дата окочания' />
            <GeneralInput index={index} placeholder='Введите факультет' name='faculty' label='Факультет' />
            <GeneralInput
                index={index}
                placeholder='Введите специализацию'
                name='speciality'
                label='Специализация (направление)'
            />
            <SelectInput
                index={index}
                data={
                    educationLevels?.map(({ id, label }) => ({
                        value: String(id),
                        label,
                    })) ?? []
                }
                onSearch={(searchValue) => setEducationLevelsValue(searchValue)}
                placeholder='Выберите из списка'
                name='education_level'
                label='Уровень образования'
            />
        </Flex>
    ));

    const handleAddNewEducation = () => {
        form.insertListItem('education', {
            institution: { name: null, value: null, label: null, key: randomId() },
            start_date: { name: null, key: randomId() },
            end_date: { name: null, key: randomId() },
            faculty: { name: null, value: null, label: null, key: randomId() },
            speciality: { name: null, value: null, label: null, key: randomId() },
            education_level: { name: null, value: null, label: null, key: randomId() },
        });
    };

    return (
        <CabinetLayout>
            <UserEducationFormProvider form={form}>
                <FormContainer id='user-education-form' onSubmit={onSubmit}>
                    <Flex w={650} direction='column'>
                        <FormCategoryName title='Место обучения' />
                        <Flex w={420} direction='column' gap='xl'>
                            <Flex direction='column' gap={56}>
                                {fields}
                            </Flex>
                            <Button
                                variant='outline'
                                display='flex'
                                classNames={{ root: s.root }}
                                onClick={handleAddNewEducation}
                            >
                                <Flex align='center' gap={8}>
                                    <Plus /> Добавить еще одно место обучения
                                </Flex>
                            </Button>
                            <Controls />
                        </Flex>
                    </Flex>
                </FormContainer>
            </UserEducationFormProvider>
        </CabinetLayout>
    );
};
