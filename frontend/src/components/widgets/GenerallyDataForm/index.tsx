import { useEffect, useState } from 'react';
import { Box, Center, Flex, Loader, LoadingOverlay, Notification } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { CheckCircle } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { Warning } from '@phosphor-icons/react/dist/ssr/Warning';
import dayjs from 'dayjs';
import { zodResolver } from 'mantine-form-zod-resolver';

import { UploadCropAvatar } from '@/components/entities';
import { CabinetLayout } from '@/layouts';
import {
    useChangeMeInfoMutation,
    useGetCitiesDictionaryQuery,
    useGetCountryTypesDictionaryQuery,
    useGetEmploymentTypesDictionaryQuery,
    useGetMainInfoByMeQuery,
    useGetSchedulesDictionaryQuery,
    useGetSkillsDictionaryQuery,
} from '@/services';
import { FormContainer } from '@/shared/ui';
import { GenerallyDataSchema } from '@/shared/validate';

import { GenerallyDataFormProvider, useGenerallyDataForm } from './model';
import {
    BornInput,
    CheckboxInput,
    Controls,
    FormCategoryName,
    GeneralInput,
    GeneralTextArea,
    KeySkills,
    MultiSelectInput,
    RadioSex,
    SelectInput,
} from './ui';

export const GenerallyDataForm = () => {
    const form = useGenerallyDataForm({
        mode: 'uncontrolled',
        name: 'generally-data-form',
        initialValues: {
            name: '',
            middlename: '',
            surname: '',
            sex: '0',
            born: null,
            city: '',
            skills: [],
            about: '',
            preferred_position: '',
            preferred_salary: 0,
            preferred_employment_type: [],
            preferred_work_schedule: [],
            business_trip: false,
            relocation: false,
            country: '',
        },
        validate: zodResolver(GenerallyDataSchema),
    });

    const [citiesValue, setCitiesValue] = useState<string>('');
    const [countriesValue, setCountriesValue] = useState<string>('');
    const [skillsValue, setSkillsValue] = useState<string>('');

    const [debouncedCitiesValue] = useDebouncedValue(citiesValue, 1000);
    const [debouncedCountriesValue] = useDebouncedValue(countriesValue, 1000);
    const [debouncedSkillsValue] = useDebouncedValue(skillsValue, 1000);

    const { data: skills, isLoading: isFetchingSkills } = useGetSkillsDictionaryQuery({
        page: 1,
        itemsPerPage: 200,
        search: debouncedSkillsValue ?? '',
    });

    const { data: shedules, isLoading: isFetchingShedule } = useGetSchedulesDictionaryQuery();
    const { data: cities, isLoading: isFetchingCities } = useGetCitiesDictionaryQuery({
        page: 1,
        itemsPerPage: 200,
        search: debouncedCitiesValue ?? '',
    });
    const { data: countries, isLoading: isFetchingCountries } = useGetCountryTypesDictionaryQuery({
        page: 1,
        itemsPerPage: 200,
        search: debouncedCountriesValue ?? '',
    });
    const { data: employments, isLoading: isFetchingEmployments } = useGetEmploymentTypesDictionaryQuery();
    const { data, isLoading: isFetchingInfo } = useGetMainInfoByMeQuery();

    useEffect(() => {
        if (data) {
            form.setValues({
                name: data.user?.name ?? '',
                middlename: data.user?.patronymic ?? '',
                surname: data.user?.surname ?? '',
                born: data.birth_date ? new Date(data.birth_date) : null,
                sex: String(data.sex?.id) ?? '0',
                preferred_salary: data.preferred_salary,
                preferred_position: data.preferred_position?.name,
                city: data.city?.name ?? '',
                skills: data.skills?.map(({ name }: { name: string }) => name) ?? [],
                about: data.about ?? '',
                business_trip: data.business_trip ?? false,
                relocation: data.relocation ?? false,
                preferred_employment_type: data.preferred_employment_type?.map(({ id }) => String(id)) ?? [],
                preferred_work_schedule: data.preferred_work_schedule?.map(({ id }) => String(id)) ?? [],
                country: data.country?.name,
            });
        }
    }, [data]);

    const [changeMeInfo, { isSuccess, isError }] = useChangeMeInfoMutation();

    const onSubmit = form.onSubmit((values) => {
        changeMeInfo({
            sex: Number(values.sex),
            birth_date: values.born ? dayjs(values.born).format('YYYY-MM-DD') : null,
            city: values.city ?? null,
            country: values.country ?? null,
            about: values.about ?? null,
            skills: values.skills,
            preferred_position: values.preferred_position ?? null,
            preferred_salary: Number(values.preferred_salary) ?? 0,
            preferred_work_schedule: values.preferred_work_schedule?.map((id) => Number(id)) ?? [],
            preferred_employment_type: values.preferred_employment_type?.map((id) => Number(id)) ?? [],
            business_trip: Boolean(values.business_trip),
            relocation: Boolean(values.relocation),
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

    const isFetching =
        isFetchingShedule || isFetchingCities || isFetchingCountries || isFetchingInfo || isFetchingSkills;

    if (isFetching) {
        return (
            <Flex p={40} align='flex-end' justify='center'>
                <Loader />
            </Flex>
        );
    }

    return (
        <CabinetLayout>
            <Box pos='relative'>
                <GenerallyDataFormProvider form={form}>
                    <FormContainer id='generally-data-form' onSubmit={onSubmit}>
                        <Flex justify='space-between' style={{ minWidth: 650 }}>
                            <Box w={420}>
                                <FormCategoryName title='Профиль' />
                                <Flex direction='column' gap='xl'>
                                    <GeneralInput name='name' label='Имя' placeholder='Введите имя' disabled />
                                    <GeneralInput
                                        name='middlename'
                                        label='Отчетство'
                                        placeholder='Введите отчество'
                                        disabled
                                    />
                                    <GeneralInput
                                        name='surname'
                                        label='Фамилия'
                                        placeholder='Введите фамилию'
                                        disabled
                                    />
                                    <RadioSex />
                                    {/* TODO: born */}
                                    <BornInput name='born' placeholder='Выберите дату' label='Дата рождения' />
                                    <SelectInput
                                        data={
                                            countries?.payload?.map(({ name }) => ({
                                                value: name,
                                                label: name,
                                            })) ?? []
                                        }
                                        onSearchValue={(searchString) => setCountriesValue(searchString)}
                                        name='country'
                                        label='Страна проживания'
                                        placeholder='Введите страну'
                                    />
                                    <SelectInput
                                        data={
                                            cities?.payload?.map(({ name }) => ({
                                                value: name,
                                                label: name,
                                            })) ?? []
                                        }
                                        onSearchValue={(searchString) => setCitiesValue(searchString)}
                                        name='city'
                                        label='Город проживания'
                                        placeholder='Введите город'
                                    />

                                    {/* TODO: textarea */}
                                    <GeneralTextArea
                                        autosize
                                        minRows={2}
                                        maxRows={15}
                                        name='about'
                                        label='О себе'
                                        placeholder='Расскажите о себе'
                                    />
                                    <FormCategoryName title='Квалификация' />
                                    <GeneralInput
                                        name='preferred_position'
                                        label='Должность'
                                        placeholder='Введите должность'
                                    />
                                    {/* TODO: chips */}
                                    <KeySkills
                                        name='skills'
                                        label='Ключевые навыки'
                                        data={skills?.payload?.map(({ id, name }) => name) ?? []}
                                        onSearch={(search) => setSkillsValue(search)}
                                        placeholder='Введите навыки'
                                    />
                                    <GeneralInput
                                        type='number'
                                        name='preferred_salary'
                                        label='Желаемая зарплата'
                                        placeholder='Введите зарплату'
                                    />
                                    <MultiSelectInput
                                        name='preferred_employment_type'
                                        data={
                                            employments?.map(({ id, label }) => ({
                                                label,
                                                value: String(id),
                                            })) ?? []
                                        }
                                        label='Тип занятости'
                                        placeholder='Введите тип'
                                    />
                                    <MultiSelectInput
                                        data={
                                            shedules?.map(({ id, label }) => ({
                                                label,
                                                value: String(id),
                                            })) ?? []
                                        }
                                        name='preferred_work_schedule'
                                        label='Предпочитаемое расписание'
                                        placeholder='Введите расписание'
                                    />
                                    <CheckboxInput name='business_trip' label='Готов к командировкам' />
                                    <CheckboxInput name='relocation' label='Готов к переезду' />
                                    <Controls />
                                </Flex>
                            </Box>
                            <UploadCropAvatar avatarUrl={data?.avatar_url} />
                        </Flex>
                    </FormContainer>
                </GenerallyDataFormProvider>
            </Box>
        </CabinetLayout>
    );
};
