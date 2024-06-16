// @ts-nocheck TODO: добавить типов
import { useEffect, useState } from 'react';
import { Box, Button, Drawer, Flex, Loader, LoadingOverlay, Text, Title } from '@mantine/core';
import { randomId, useDisclosure } from '@mantine/hooks';
import { Plus, UserCirclePlus } from '@phosphor-icons/react';
import { extend } from '@syncfusion/ej2-base';
import { ColumnDirective, ColumnsDirective, KanbanComponent } from '@syncfusion/ej2-react-kanban';
import cn from 'clsx';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { KanbanAddNewRecruiter, KanbanVacancyView } from '@/components/features';
import { useChangeVacancyStatusMutation, useGetAllVacanciesForRecruiterQuery } from '@/services/VacanciesService';
import { vacanciesStatus } from '@/shared/constants';

import s from './VacanciesBoard.module.css';

const colors: Record<string, string> = {
    Новые: '#228BE6',
    Активные: '#FAB005',
    Неактивные: '#FA5252',
    Завершенные: '#2F9E44',
    Архив: '#909296',
};

const params = {
    // page: 1,
    // itemsPerPage: 10,
    // sortDesc: false,
    // search: '',
    // sortBy: '',
    // status__in: 0,
    // category__in: 0,
};

export const VacanciesBoard = () => {
    const { pathname, push } = useRouter();

    const [dataKanban, setDataKanban] = useState<any>([]);
    const [currentVacancy, setCurrentVacancy] = useState<any>({});
    const [isViewVacancy, setIsViewVacancy] = useState(false);

    const [opened, { open, close }] = useDisclosure(false);

    const { data: vacancies, isLoading, isFetching } = useGetAllVacanciesForRecruiterQuery(params);
    const [changeVacancyStatus] = useChangeVacancyStatusMutation();

    useEffect(() => {
        if (vacancies) {
            const temp = vacancies.payload?.map(
                ({ id, salary, department, position, created_at, city, status, description, ...data }) => ({
                    id: id,
                    status: status.name,
                    summary: description,
                    position,
                    city,
                    created_at,
                    department,
                    salary,
                    ...data,
                })
            );

            setDataKanban(extend([], temp, null, true));
        }
    }, [vacancies]);

    const renderCard = (e: any) => {
        const handleViewVacancy = () => {
            open();
            setIsViewVacancy(true);
            setCurrentVacancy(e);
        };

        return (
            <Flex direction='column' justify='space-between' p={12} onClick={handleViewVacancy}>
                <Flex direction='column' gap={4}>
                    <Flex justify='space-between' mb={4}>
                        <Text c='dimmed' style={{ fontSize: 12 }}>
                            {e?.city?.name}
                        </Text>
                        <Text c='dimmed' style={{ fontSize: 12 }}>
                            {dayjs(e?.created_at).format('DD.MM.YYYY')}
                        </Text>
                    </Flex>
                    <Title order={6}>{e?.position?.name}</Title>
                </Flex>
                <Flex direction='column'>
                    <Text>{e?.department?.name}</Text>
                    <Flex justify='flex-end'>
                        <Title order={6}>{e?.salary}&nbsp;₽</Title>
                    </Flex>
                </Flex>
            </Flex>
        );
    };

    const renderColumn = (e: any) => (
        <Flex wrap='nowrap' align='center' gap={4}>
            <Box
                style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: colors[e?.headerText],
                }}
            />
            <Title order={4}>{e?.headerText}</Title>
            <Title order={4} style={{ color: '#909296' }}>
                ({e?.count})
            </Title>
        </Flex>
    );

    const handleDragStop = (e: any) => {
        changeVacancyStatus({
            vacancy_id: e?.data?.[0]?.id ?? '',
            status: vacanciesStatus[e?.data?.[0]?.status],
        });
    };

    const handleInviteRecruiter = () => {
        open();
        setIsViewVacancy(false);
    };

    const handleAddVacancy = () => {
        push('/recruiter/process/vacancy/create');
    };

    return (
        <Flex p={20} gap={20} direction='column'>
            <Flex justify='space-between'>
                <Flex gap={12} pl={10}>
                    <Button style={{ padding: '8px 12px' }} onClick={handleAddVacancy}>
                        <Flex gap={8} align='center'>
                            <Plus size={20} />
                            Добавить вакансию
                        </Flex>
                    </Button>
                    <Button style={{ padding: '8px 12px' }} onClick={handleInviteRecruiter}>
                        <Flex gap={8} align='center'>
                            <UserCirclePlus size={20} />
                            Пригласить рекрутера
                        </Flex>
                    </Button>
                </Flex>
                {/*TODO: Поиск вакансий*/}
                {/*<Input />*/}
            </Flex>
            {isLoading && <Loader pos='absolute' top='50%' left='50%' />}
            {!isLoading && (
                <Box pos='relative'>
                    <LoadingOverlay visible={isFetching} zIndex={1} overlayProps={{ radius: 'sm' }} />

                    <KanbanComponent
                        className={s.root}
                        id='kanban'
                        disabled={true}
                        cardDoubleClick={(e) => {
                            if (e?.cancel) {
                                e.cancel = true;
                            }
                        }}
                        dragStop={handleDragStop}
                        keyField='status'
                        dataSource={dataKanban}
                        cardSettings={{
                            contentField: 'summary',
                            headerField: 'id',
                            template: renderCard,
                        }}
                        allowDragAndDrop={!isFetching}
                    >
                        <ColumnsDirective>
                            <ColumnDirective template={renderColumn} headerText='Новые' keyField='Новая' />
                            <ColumnDirective template={renderColumn} headerText='Активные' keyField='Активная' />
                            <ColumnDirective template={renderColumn} headerText='Неактивные' keyField='Неактивная' />
                            <ColumnDirective template={renderColumn} headerText='Завершенные' keyField='Завершенная' />
                            <ColumnDirective template={renderColumn} headerText='Архив' keyField='Архивная' />
                        </ColumnsDirective>
                    </KanbanComponent>
                </Box>
            )}
            <Drawer
                opened={opened}
                position='right'
                onClose={close}
                title={<Title order={3}>{isViewVacancy ? 'Детали вакансии' : 'Приглашение рекрутера'}</Title>}
            >
                {isViewVacancy ? <KanbanVacancyView vacancyId={currentVacancy?.id ?? ''} /> : <KanbanAddNewRecruiter />}
            </Drawer>
        </Flex>
    );
};
