import { useEffect, useState } from 'react';
import { Box, Flex, Loader, LoadingOverlay } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useRouter } from 'next/router';
import { z } from 'zod';

import { UploadCropAvatar } from '@/components/entities';
import { CabinetLayout } from '@/layouts';
import {
    useChangeMeInfoMutation,
    useGetCategoriesDictionaryQuery,
    useGetCitiesDictionaryQuery,
    useGetCountryTypesDictionaryQuery,
    useGetDepartmentsDictionaryQuery,
    useGetEmploymentTypesDictionaryQuery,
    useGetInfoRecruiterByMeQuery,
    useGetMainInfoByMeQuery,
    useGetPositionDictionaryQuery,
    useGetSchedulesDictionaryQuery,
    useGetSkillsDictionaryQuery,
    useGetTemplatesOfBenefitsDictionaryQuery,
    useGetTemplatesOfTasksDictionaryQuery,
} from '@/services';
import {
    useChangeVacancyMutation,
    useCreateVacancyMutation,
    useGetVacancyByIdQuery,
} from '@/services/VacanciesService';
import { FormContainer } from '@/shared/ui';
import { VacancyFormSchema } from '@/shared/validate';

import { useVacancyForm, VacancyFormProvider } from './model';
import { Controls, FormCategoryName, GeneralInput, GeneralTextArea, InputEmail, KeySkills, SelectInput } from './ui';

export const VacancyForm = ({ isEditMode }: { isEditMode?: boolean }) => {
    const form = useVacancyForm({
        mode: 'uncontrolled',
        name: 'vacancy-form',
        initialValues: {
            name: '',
            patronymic: '',
            surname: '',
            email: null,
            phone: '',
            recruiter_position: '',
            position: '',
            department: '',
            country: '',
            city: '',
            preferred_salary: '',
            category: '',
            employment_type: '',
            work_schedule: '',
            description: '',
            tasks: '',
            skills: [],
            additional_requirements: '',
            benefits: '',
        },
        validate: zodResolver(VacancyFormSchema),
    });

    const [skillsValue, setSkillsValue] = useState('');

    const [debouncedSkillsValue] = useDebouncedValue(skillsValue, 1000);

    const { back, query } = useRouter();

    const { id: vacancy_id } = query;

    const { data: currentVacancy, isFetching: isFetchingCurrentVacancy } = useGetVacancyByIdQuery(
        {
            vacancy_id: (vacancy_id as string) ?? '',
        },
        { skip: !vacancy_id, refetchOnMountOrArgChange: true }
    );
    const { data: recruiterInfo } = useGetInfoRecruiterByMeQuery();

    const { data: shedules, isFetching: isFetchingShedules } = useGetSchedulesDictionaryQuery();
    const { data: cities, isFetching: isFetchingCities } = useGetCitiesDictionaryQuery({
        page: 1,
        itemsPerPage: 200,
    });
    const { data: countries, isFetching: isFetchingCountries } = useGetCountryTypesDictionaryQuery({
        page: 1,
        itemsPerPage: 200,
    });
    const { data: categories, isFetching: isFetchingCategories } = useGetCategoriesDictionaryQuery();
    const { data: positions, isFetching: isFetchingPositions } = useGetPositionDictionaryQuery({
        page: 1,
        itemsPerPage: 200,
    });
    const { data: employments, isFetching: isFetchingEmployments } = useGetEmploymentTypesDictionaryQuery();
    const { data: templatesOfBenefits, isFetching: isFetchingBenefits } = useGetTemplatesOfBenefitsDictionaryQuery({});
    const { data: templatesOfTasks, isFetching: isFetchingTasks } = useGetTemplatesOfTasksDictionaryQuery({});
    const { data: departments, isFetching: isFetchingDepartments } = useGetDepartmentsDictionaryQuery({
        page: 1,
        itemsPerPage: 200,
    });

    const { data: skills, isLoading: isFetchingSkills } = useGetSkillsDictionaryQuery({
        page: 1,
        itemsPerPage: 200,
        search: debouncedSkillsValue ?? '',
    });

    const [createVacancy, { isSuccess: isSuccessCreate, isError: isErrorCreate }] = useCreateVacancyMutation();
    const [changeVacancy, { isSuccess: isSuccessChange, isError: isErrorChange }] = useChangeVacancyMutation();

    const onSubmit = form.onSubmit((values) => {
        const formValues = {
            position: values.position ?? null,
            department: values.department ?? null,
            country: values.country ?? null,
            city: values.city ?? null,
            salary: values.preferred_salary ? Number(values.preferred_salary) : null,
            category: values.category ? Number(values.category) : null,
            work_schedule: values.work_schedule ? Number(values.work_schedule) : null,
            employment_type: values.employment_type ? Number(values.employment_type) : null,
            description: values.description ?? null,
            tasks: values.tasks ?? null,
            tasks_used_as_template: false ?? null,
            skills: values.skills ?? null,
            benefits: values.benefits ?? null,
            benefits_used_as_template: false,
            additional_requirements: values.additional_requirements ?? null,
        };

        if (vacancy_id) {
            changeVacancy({
                ...formValues,
                vacancy_id: vacancy_id as string,
            });

            return;
        }

        createVacancy(formValues);
    });

    useEffect(() => {
        if (currentVacancy) {
            form.initialize({
                name: currentVacancy.responsible_recruiter?.name ?? '',
                patronymic: currentVacancy.responsible_recruiter?.patronymic ?? '',
                surname: currentVacancy.responsible_recruiter?.surname ?? '',
                email: currentVacancy.responsible_recruiter?.email ?? '',
                phone: currentVacancy.responsible_recruiter?.recruiter_info?.phone ?? '',
                recruiter_position: currentVacancy.responsible_recruiter?.recruiter_info?.position ?? '',
                position: currentVacancy.position?.name ?? '',
                department: currentVacancy.department?.name ?? '',
                country: currentVacancy.country?.name ?? '',
                city: currentVacancy.city?.name ?? '',
                preferred_salary: currentVacancy.salary ?? '',
                category: String(currentVacancy.category?.id) ?? '',
                employment_type: String(currentVacancy.employment_type?.id) ?? '',
                work_schedule: String(currentVacancy.work_schedule?.id) ?? '',
                description: currentVacancy.description ?? '',
                tasks: currentVacancy.tasks ?? '',
                skills: currentVacancy.skills?.map(({ name }) => name) ?? '',
                additional_requirements: currentVacancy.additional_requirements ?? '',
                benefits: currentVacancy.benefits ?? '',
            });
        }
    }, [currentVacancy]);

    useEffect(() => {
        if (!currentVacancy && !vacancy_id && recruiterInfo) {
            form.initialize({
                name: recruiterInfo.user?.name ?? '',
                patronymic: recruiterInfo.user?.patronymic ?? '',
                surname: recruiterInfo.user?.surname ?? '',
                email: recruiterInfo.email ?? '',
                phone: recruiterInfo.phone ?? '',
                recruiter_position: recruiterInfo.position ?? '',
                position: '',
                department: '',
                country: '',
                city: '',
                preferred_salary: '',
                category: '',
                employment_type: '',
                work_schedule: '',
                description: '',
                tasks: '',
                skills: [],
                additional_requirements: '',
                benefits: '',
            });
        }
    }, [recruiterInfo, currentVacancy]);

    useEffect(() => {
        if (isSuccessChange || isSuccessCreate) {
            back();
        }
    }, [isSuccessChange, isSuccessCreate]);

    useEffect(() => {
        if (isErrorCreate || isErrorChange) {
            notifications.show({
                title: 'Произошла ошибка!',
                message: 'Не удалось сохранить данные',
                color: 'red',
            });
        }

        if (isSuccessChange || isSuccessCreate) {
            notifications.show({
                title: 'Успех!',
                message: 'Данные успешно сохранены',
                color: 'green',
            });
        }
    }, [isSuccessChange, isErrorCreate, isErrorChange, isSuccessCreate]);

    const isLoading =
        isFetchingShedules ||
        isFetchingCities ||
        isFetchingCountries ||
        isFetchingCategories ||
        isFetchingPositions ||
        isFetchingEmployments ||
        isFetchingBenefits ||
        isFetchingTasks ||
        isFetchingDepartments ||
        isFetchingCurrentVacancy ||
        isFetchingSkills;

    if (isLoading) {
        return (
            <Flex p={40} align='flex-end' justify='center'>
                <Loader />
            </Flex>
        );
    }

    return (
        <CabinetLayout>
            <VacancyFormProvider form={form}>
                <FormContainer id='vacancy-form' onSubmit={onSubmit}>
                    <Flex justify='space-between' style={{ minWidth: 650 }}>
                        <Box w={420}>
                            <FormCategoryName title='Описание вакансии' />
                            <Flex direction='column' gap='xl'>
                                <SelectInput
                                    data={positions?.payload?.map(({ id, name }) => name) ?? []}
                                    name='position'
                                    label='Наименование должности'
                                    placeholder='Выберите из списка'
                                />
                                <SelectInput
                                    data={departments?.payload?.map(({ id, name }) => name) ?? []}
                                    name='department'
                                    label='Отдел или подразделение компании'
                                    placeholder='Выберите из списка'
                                />
                                <SelectInput
                                    data={countries?.payload?.map(({ name }) => name) ?? []}
                                    name='country'
                                    label='Страна'
                                    placeholder='Выберите из списка'
                                />
                                <SelectInput
                                    data={cities?.payload?.map(({ name }) => name ?? 'Москва') ?? []}
                                    name='city'
                                    label='Город'
                                    placeholder='Выберите из списка'
                                />
                                <GeneralInput
                                    type='number'
                                    name='preferred_salary'
                                    label='Зарплата, от ₽'
                                    placeholder='150000'
                                />
                                <SelectInput
                                    data={
                                        categories?.map(({ id, label }) => ({
                                            value: String(id),
                                            label,
                                        })) ?? []
                                    }
                                    name='category'
                                    label='Категория'
                                    placeholder='Выберите из списка'
                                />
                                <SelectInput
                                    data={
                                        employments?.map(({ label, id }) => ({
                                            value: String(id),
                                            label,
                                        })) ?? []
                                    }
                                    name='employment_type'
                                    label='Тип занятости'
                                    placeholder='Выберите из списка'
                                />
                                <SelectInput
                                    data={
                                        shedules?.map(({ label, id }) => ({
                                            value: String(id),
                                            label,
                                        })) ?? []
                                    }
                                    name='work_schedule'
                                    label='График работы'
                                    placeholder='Выберите из списка'
                                />
                                <GeneralTextArea
                                    autosize
                                    minRows={2}
                                    maxRows={15}
                                    name='description'
                                    label='Описание'
                                    placeholder='Добавьте описание вакансии'
                                />
                                <GeneralTextArea
                                    autosize
                                    minRows={2}
                                    maxRows={15}
                                    name='tasks'
                                    label='Задачи'
                                    placeholder='Укажите, какие задачи будет решать кандидат во время работы'
                                />
                                <KeySkills
                                    name='skills'
                                    label='Требуемые навыки и знания'
                                    data={skills?.payload?.map(({ id, name }) => name) ?? []}
                                    onSearch={(search) => setSkillsValue(search)}
                                    placeholder='Укажите требуемые навыки и знания'
                                />
                                <GeneralTextArea
                                    autosize
                                    minRows={2}
                                    maxRows={15}
                                    name='additional_requirements'
                                    label='Дополнительные требования'
                                    placeholder='Укажите требования, которые будут плюсом для кандидата'
                                />
                                <GeneralTextArea
                                    autosize
                                    minRows={2}
                                    maxRows={15}
                                    name='benefits'
                                    label='Условия работы'
                                    placeholder='Укажите условия работы'
                                />

                                {/*TODO: Контакты рекрутера*/}
                                <FormCategoryName title='Контакты рекрутера' />
                                <GeneralInput name='surname' label='Фамилия' />
                                <GeneralInput name='name' label='Имя' />
                                <GeneralInput name='patronymic' label='Отчество' />
                                <InputEmail />
                                <GeneralInput name='phone' label='Телефон' />
                                <GeneralInput name='recruiter_position' label='Должность' />
                                <Controls isEditMode />
                            </Flex>
                        </Box>
                    </Flex>
                </FormContainer>
            </VacancyFormProvider>
        </CabinetLayout>
    );
};
