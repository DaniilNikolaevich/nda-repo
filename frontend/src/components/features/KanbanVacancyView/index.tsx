import { Button, Chip, Flex, Text, Title } from '@mantine/core';
import { Copy } from '@phosphor-icons/react/dist/ssr/Copy';
import { PencilSimple } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';

import s from '@/components/entities/ProfileInfoTitle/ProfileInfoTitle.module.css';
import { useDublicateVacancyMutation, useGetVacancyByIdQuery } from '@/services/VacanciesService';

interface KanbanVacancyViewProps {
    vacancyId: string;
}

export const KanbanVacancyView = ({ vacancyId }: KanbanVacancyViewProps) => {
    const { pathname, query, push } = useRouter();
    const { data: vacancyById } = useGetVacancyByIdQuery(
        {
            vacancy_id: vacancyId ?? '',
        },
        {
            skip: !vacancyId,
            refetchOnMountOrArgChange: true,
        }
    );
    const [dublicateVacancy] = useDublicateVacancyMutation();

    const handleEditVacancy = () => {
        push(`/recruiter/process/vacancy/edit/${vacancyId}`);
    };

    const handleDublicateVacancy = () => {
        dublicateVacancy({
            vacancy_id: vacancyId,
        });
    };

    return (
        <Flex direction='column' gap={20}>
            <Flex direction='column' gap={4}>
                <Text size='sm' fw={600}>
                    Статус вакансии
                </Text>
                <Text>{vacancyById?.status?.name}</Text>
            </Flex>
            <Flex justify='space-between'>
                <Title order={4}>{vacancyById?.position?.name}</Title>
                <Flex gap={12}>
                    <Button variant='light' onClick={handleDublicateVacancy}>
                        <Copy size={20} />
                    </Button>
                    <Button variant='light' onClick={handleEditVacancy}>
                        <PencilSimple size={20} />
                    </Button>
                </Flex>
            </Flex>
            <Flex direction='column' gap={12}>
                <Text size='sm' fw={600}>
                    Дата создания
                </Text>
                <Text>{dayjs(vacancyById?.created_at).format('DD.MM.YYYY')}</Text>
            </Flex>
            <Flex gap={20}>
                <Flex direction='column' w={210} gap={12}>
                    <Text size='sm' fw={600}>
                        Страна
                    </Text>
                    <Text>{vacancyById?.country?.name}</Text>
                </Flex>
                <Flex direction='column' w={210} gap={12}>
                    <Text size='sm' fw={600}>
                        Город
                    </Text>
                    <Text>{vacancyById?.city?.name}</Text>
                </Flex>
            </Flex>
            <Flex direction='column' gap={12}>
                <Text size='sm' fw={600}>
                    Категория
                </Text>
                <Flex gap={12} wrap='wrap'>
                    {vacancyById?.skills?.map(({ name }, index) => (
                        <Chip key={index} className={s.chip} disabled>
                            {name}
                        </Chip>
                    ))}
                </Flex>
            </Flex>
            <Flex direction='column' gap={12}>
                <Text size='sm' fw={600}>
                    Отдел или подразделение компании
                </Text>
                <Text>{vacancyById?.department?.name}</Text>
            </Flex>
            <Flex direction='column' gap={12}>
                <Text size='sm' fw={600}>
                    ЗП
                </Text>
                <Text>{vacancyById?.salary}</Text>
            </Flex>
            <Flex direction='column' gap={12}>
                <Text size='sm' fw={600}>
                    Тип занятости
                </Text>
                <Text>{vacancyById?.employment_type?.name}</Text>
            </Flex>
            <Flex direction='column' gap={12}>
                <Text size='sm' fw={600}>
                    Расписание
                </Text>
                <Text>{vacancyById?.work_schedule?.name}</Text>
            </Flex>
            <Flex direction='column' gap={12}>
                <Text size='sm' fw={600}>
                    Описание
                </Text>
                <Text>{vacancyById?.description}</Text>
            </Flex>
            <Flex direction='column' gap={12}>
                <Text size='sm' fw={600}>
                    Задачи
                </Text>
                <Text>{vacancyById?.tasks}</Text>
            </Flex>
            <Flex direction='column' gap={12}>
                <Text size='sm' fw={600}>
                    Требуемые навыки и знания
                </Text>
                <Text>{vacancyById?.additional_requirements}</Text>
            </Flex>
            <Flex direction='column' gap={12}>
                <Text size='sm' fw={600}>
                    Дополнительные требования (будет плюсом)
                </Text>
                <Text>{vacancyById?.additional_requirements}</Text>
            </Flex>
        </Flex>
    );
};
