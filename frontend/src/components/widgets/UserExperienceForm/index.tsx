import { useEffect, useState } from 'react';
import { Button, Flex, Loader } from '@mantine/core';
import { randomId, useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';
import dayjs from 'dayjs';
import { zodResolver } from 'mantine-form-zod-resolver';

import { GeneralDateInput } from '@/components/widgets/UserEducationForm/ui';
import { CabinetLayout } from '@/layouts';
import {
    useGetAllWorkExperienceByMeQuery,
    useGetCompaniesDictionaryQuery,
    useGetPositionDictionaryQuery,
    useSetWorkExperienceByMeMutation,
} from '@/services';
import { FormContainer } from '@/shared/ui';
import { UserExperienceSchema } from '@/shared/validate';

import { UserExperienceFormProvider, useUserExperienceForm } from './model';
import {
    Controls,
    FormCategoryName,
    GeneralInput,
    GeneralTextArea,
    SelectInput,
    UserExperienceDateInput,
    WorkPeriod,
} from './ui';
import s from './UserExperienceForm.module.css';

export const UserExperienceForm = () => {
    const form = useUserExperienceForm({
        mode: 'uncontrolled',
        name: 'user-experience-form',
        initialValues: {
            experience: [
                {
                    company: { name: '', value: '', label: '', key: randomId() },
                    position: { name: '', value: '', label: '', key: randomId() },
                    start_date: { name: null, key: randomId() },
                    end_date: { name: null, key: randomId() },
                    duties: { name: '', value: '', label: '', key: randomId() },
                    achievements: { name: '', value: '', label: '', key: randomId() },
                },
            ],
        },
        validate: zodResolver(UserExperienceSchema),
    });

    const [positionsValue, setPositionsValue] = useState<string>('');
    const [companiesValue, setCompaniesValue] = useState<string>('');

    const [debouncedPositionsValue] = useDebouncedValue(positionsValue, 1000);
    const [debouncedCompaniesValue] = useDebouncedValue(companiesValue, 1000);

    const { data, isLoading: isFetchingInfo } = useGetAllWorkExperienceByMeQuery();
    const { data: positions, isLoading: isFetchingPositions } = useGetPositionDictionaryQuery({
        page: 1,
        itemsPerPage: 200,
        search: debouncedPositionsValue,
    });
    const { data: companies, isLoading: isFetchingCompanies } = useGetCompaniesDictionaryQuery({
        page: 1,
        itemsPerPage: 200,
        search: debouncedCompaniesValue,
    });

    useEffect(() => {
        if (data) {
            form.initialize({
                experience: data.map(({ company, achievements, duties, end_date, position, start_date }) => ({
                    company: {
                        name: company?.name ?? null,
                        value: company?.name,
                        label: company?.name,
                        key: randomId(),
                    },
                    position: {
                        name: position?.name ?? null,
                        value: position?.name ?? null,
                        label: position?.name,
                        key: randomId(),
                    },
                    start_date: { name: start_date ? new Date(start_date) : null, key: randomId() },
                    end_date: { name: end_date ? new Date(end_date) : null, key: randomId() },
                    duties: {
                        name: duties ?? null,
                        value: duties ?? null,
                        label: duties ?? null,
                        key: randomId(),
                    },
                    achievements: {
                        name: achievements ?? null,
                        value: achievements ?? null,
                        label: achievements ?? null,
                        key: randomId(),
                    },
                })),
            });
        }
    }, [data]);
    const [setMeWork, { isError, isSuccess }] = useSetWorkExperienceByMeMutation();

    const onSubmit = form.onSubmit((values) => {
        setMeWork(
            values?.experience?.map(({ company, achievements, duties, position, start_date, end_date }) => ({
                company: company?.value ?? null,
                position: position?.value ?? null,
                start_date: start_date.name ? dayjs(start_date.name).format('YYYY-MM-DD') : null,
                end_date: end_date.name ? dayjs(end_date.name).format('YYYY-MM-DD') : null,
                duties: duties.name ?? null,
                achievements: achievements?.name ?? null,
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

    const isFetching = isFetchingPositions || isFetchingCompanies || isFetchingInfo;

    if (isFetching) {
        return (
            <Flex p={40} align='flex-end' justify='center'>
                <Loader />
            </Flex>
        );
    }

    const fields = form.getValues().experience.map((item, index) => (
        <Flex key={index} direction='column' gap='xl'>
            <SelectInput
                index={index}
                data={companies?.payload?.map(({ id, name }) => name) ?? []}
                onSearch={(search) => setCompaniesValue(search)}
                placeholder='Выберите компанию из списка'
                name='company'
                label='Компания'
            />
            <SelectInput
                index={index}
                data={positions?.payload?.map(({ id, name }) => name) ?? []}
                onSearch={(search) => setPositionsValue(search)}
                placeholder='Выберите должность из списка'
                name='position'
                label='Должность'
            />
            <UserExperienceDateInput index={index} placeholder='Выберите дату' name='start_date' label='Дата начала' />
            <UserExperienceDateInput index={index} placeholder='Выберите дату' name='end_date' label='Дата окочания' />
            <GeneralTextArea index={index} name='duties' label='Обязанности' placeholder='В этой компании я...' />
            <GeneralTextArea
                index={index}
                name='achievements'
                label='Достижения'
                placeholder='Напишите достижения за период работы'
            />
        </Flex>
    ));

    const handleAddNewWork = () => {
        form.insertListItem('experience', {
            company: { name: '', value: '', label: '', key: randomId() },
            position: { name: '', value: '', label: '', key: randomId() },
            start_date: { name: null, key: randomId() },
            end_date: { name: null, key: randomId() },
            duties: { name: '', value: '', label: '', key: randomId() },
            achievements: { name: '', value: '', label: '', key: randomId() },
        });
    };

    return (
        <CabinetLayout>
            <UserExperienceFormProvider form={form}>
                <FormContainer id='user-experience-form' onSubmit={onSubmit}>
                    <Flex w='650' direction='column'>
                        <FormCategoryName title='Место работы' />
                        <Flex direction='column' w={420} gap='xl'>
                            <Flex direction='column' gap={56}>
                                {fields}
                            </Flex>
                            <Button
                                variant='outline'
                                display='flex'
                                classNames={{ root: s.root }}
                                onClick={handleAddNewWork}
                            >
                                <Flex align='center' gap={8}>
                                    <Plus /> Добавить еще одно место работы
                                </Flex>
                            </Button>
                            <Controls />
                        </Flex>
                    </Flex>
                </FormContainer>
            </UserExperienceFormProvider>
        </CabinetLayout>
    );
};
