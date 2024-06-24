import { useEffect, useState } from 'react';
import { DonutChart, LineChart } from '@mantine/charts';
import { Center, Flex, Loader, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';

import {
    useGetAllVacanciesForRecruiterQuery,
    useGetAvgTimeByVacanciesQuery,
    useGetCountVacanciesByStatusesQuery,
    useGetCountViewByVacanciesQuery,
} from '@/services';
import { getDeclinations } from '@/shared/utils';

import s from './Dashboard.module.css';

const colors = [
    'red',
    'green',
    'brown',
    'grey',
    'orange',
    'purple',
    'black',
    'pink',
    'blue',
    '#7AD1DD',
    '#F0BBDD',
    '#4a5167',
];

export const Dashboard = () => {
    const [sumVacancies, setSumVacancies] = useState<number>(0);
    const [dataColors, setDataColors] = useState<Array<{ name: string; color: string }>>([]);
    const { data: countVacancies, isFetching: isFetchingCounts } = useGetCountVacanciesByStatusesQuery(null, {
        refetchOnMountOrArgChange: true,
    });
    const { data: avgTimes, isFetching: isFetchingAvgTimes } = useGetAvgTimeByVacanciesQuery(null, {
        refetchOnMountOrArgChange: true,
    });
    const { data: countViews, isFetching: isFetchingCountViews } = useGetCountViewByVacanciesQuery(null, {
        refetchOnMountOrArgChange: true,
    });
    const { data: vacancies } = useGetAllVacanciesForRecruiterQuery({
        status__in: 1,
    });

    const totalVacancies = vacancies ? vacancies?.total_count * vacancies.total_pages : 0;

    useEffect(() => {
        if (countVacancies) {
            let sum = 0;

            countVacancies.forEach(({ value }) => {
                sum += value;
            });

            setSumVacancies(sum);
        }
    }, [countVacancies]);

    useEffect(() => {
        if (countViews?.data) {
            setDataColors(
                Object.keys(countViews?.data?.[0] ?? [])
                    ?.filter((item) => item !== 'date')
                    ?.map((item) => ({
                        name: item,
                        color: colors[Math.floor(Math.random() * colors.length)],
                    }))
            );
        }
    }, [countViews]);

    if (isFetchingCounts || isFetchingAvgTimes || isFetchingCountViews) {
        return (
            <Center>
                <Loader />
            </Center>
        );
    }

    return (
        <Flex direction='column' gap={20} mih='calc(84vh)' py={20}>
            <Flex direction='column' justify='flex-start' mih={306} py={16} px={24} gap={20}>
                <Flex direction='column' gap={12}>
                    <Flex justify='space-between'>
                        <Title order={4}>Количество вакансий по статусам</Title>
                        <Text c='dimmed'>
                            {getDeclinations({
                                count: totalVacancies,
                                one: 'активная вакансия',
                                few: 'активных вакансий',
                                many: 'активных вакансий',
                            })}
                        </Text>
                    </Flex>
                    <Text c='#4263EB' fw={500}>
                        Всего{' '}
                        {getDeclinations({
                            count: countViews?.total_views ?? 0,
                            one: 'просмотр',
                            few: 'просмотра',
                            many: 'просмотра',
                        })}
                    </Text>
                </Flex>
                {countViews?.data && countViews?.data?.[0] && (
                    <>
                        <LineChart
                            h={200}
                            data={
                                countViews?.data?.map((item) => ({
                                    ...item,
                                    date: dayjs(item.date).format('dd').toUpperCase(),
                                })) ?? []
                            }
                            dataKey='date'
                            gridAxis='none'
                            withTooltip={false}
                            series={dataColors}
                        />
                        <Flex direction='column' gap={8} pt={20}>
                            {dataColors &&
                                dataColors.map(
                                    ({ name, color }, index) =>
                                        index > 0 && (
                                            <Flex key={name} gap={4} align='center'>
                                                <div
                                                    style={{
                                                        width: 8,
                                                        height: 8,
                                                        backgroundColor: `${color ? color : 'red'}`,
                                                        borderRadius: '50%',
                                                    }}
                                                />
                                                <Text size='xs'>{name}</Text>
                                            </Flex>
                                        )
                                )}
                        </Flex>
                    </>
                )}
            </Flex>
            <Flex mih={278} gap={20}>
                <Flex direction='column' gap={20} w={582} px={20} py={16} miw={300} style={{ borderRadius: '16px' }}>
                    <Title order={4}>Количество вакансий по статусам</Title>
                    <Flex gap={12} align='center'>
                        <DonutChart
                            classNames={{
                                label: s.label,
                            }}
                            className={s.donutChart}
                            withTooltip={false}
                            size={188}
                            h={250}
                            w={250}
                            thickness={30}
                            chartLabel={getDeclinations({
                                count: sumVacancies,
                                one: 'вакансия',
                                few: 'вакансий',
                                many: 'вакансии',
                            })}
                            data={countVacancies ?? []}
                        />
                        <Flex direction='column' gap={12}>
                            {countVacancies?.map(({ name, color }) => (
                                <Flex key={name} gap={4} align='center'>
                                    <div
                                        style={{
                                            width: 8,
                                            height: 8,
                                            backgroundColor: color.split('.')[0],
                                            borderRadius: '50%',
                                        }}
                                    />
                                    <Text size='xs'>{name}</Text>
                                </Flex>
                            ))}
                        </Flex>
                    </Flex>
                </Flex>
                <Flex direction='column' gap={20} px={20} py={16} w={582} miw={300}>
                    {avgTimes && (
                        <>
                            <Title order={4}>Среднее время работы с кандидатом</Title>
                            <Flex>
                                <Text style={{ fontSize: 40, color: '#4263EB' }}>
                                    {getDeclinations({
                                        count: avgTimes.days,
                                        one: 'день',
                                        few: 'дней',
                                        many: 'дней',
                                    })}
                                    &nbsp;
                                </Text>
                                <Text style={{ fontSize: 40, color: '#909296' }}>
                                    {getDeclinations({
                                        count: avgTimes.hours,
                                        one: 'час',
                                        few: 'часов',
                                        many: 'часов',
                                    })}
                                </Text>
                            </Flex>
                            <Text c='dimmed' style={{ fontSize: 16 }}>
                                От отклика до оффера по всем вакансиям
                            </Text>
                        </>
                    )}
                </Flex>
            </Flex>
        </Flex>
    );
};
