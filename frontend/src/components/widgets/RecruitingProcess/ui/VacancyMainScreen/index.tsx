import { useEffect } from 'react';
import { Button, Flex, Group, NumberFormatter, Paper, Stack, Text, Title } from '@mantine/core';
import { ArrowSquareOut } from '@phosphor-icons/react/dist/ssr/ArrowSquareOut';
import { ChatDots } from '@phosphor-icons/react/dist/ssr/ChatDots';
import { FileText } from '@phosphor-icons/react/dist/ssr/FileText';
import Link from 'next/link';

import { STORAGE, useDownloadResumeQuery, useLazyDownloadResumeQuery } from '@/services';
import { API_ROUTES } from '@/shared/api';

import { useSelectedVacancy } from '../../model/useSelectedVacancy';
import { AIQuestions } from './AIQuestions';
import { AISummary } from './AISummary';
import { Contacts } from './Contacts';
import { Controls } from './Controls';

const downloadFile = (target_user_id: string) => {
    fetch(`${API_ROUTES.baseUrl}/users/${target_user_id}/download-cv`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/pdf',
            Authorization: `Bearer ${STORAGE.getToken()}`,
        },
    })
        .then((response) => {
            const contentType = response.headers.get('content-type');
            const blob = response.blob();
            return { contentType, blob };
        })
        .then(({ contentType, blob }: any) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            const fileType = contentType.split('/')[1];
            console.log('fileType', fileType);

            a.href = url;
            a.download = 'file.txt'; // Замените 'file.txt' на желаемое имя файла
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        })
        .catch((error) => console.error('Ошибка при скачивании файла:', error));
};

export const VacancyMainScreen = () => {
    const { filteredProcessModel, selectedProcessUser } = useSelectedVacancy();

    const [download, { data }] = useLazyDownloadResumeQuery();
    const currentUser = filteredProcessModel?.find((el) => el.id === selectedProcessUser);

    return (
        <Paper w='100%' h='72vh' style={{ overflow: 'auto' }}>
            <Stack gap='var(--size-lg)'>
                <Flex gap='var(--size-lg)' justify='space-between' align='center' wrap='wrap'>
                    <Title fz={20}>{currentUser?.candidate.fullname}</Title>
                    <Button
                        component={Link}
                        href={`/profiles/${currentUser?.candidate?.id}`}
                        variant='light'
                        leftSection={<ArrowSquareOut weight='bold' size={20} />}
                    >
                        Перейти в профиль
                    </Button>
                </Flex>
                <Stack gap='var(--size-sm)'>
                    {currentUser?.candidate?.info?.preferred_salary && (
                        <Group>
                            <Text fz={14} c='dimmed' w={64}>
                                Зарплата
                            </Text>
                            <Text fz={14} fw={600}>
                                <NumberFormatter
                                    value={currentUser?.candidate?.info?.preferred_salary}
                                    suffix=' ₽'
                                    thousandSeparator=' '
                                />
                            </Text>
                        </Group>
                    )}
                    {currentUser?.candidate?.info?.city?.name && (
                        <Group>
                            <Text fz={14} c='dimmed' w={64}>
                                Город
                            </Text>
                            <Text fz={14} fw={600}>
                                {currentUser?.candidate?.info?.city?.name}
                            </Text>
                        </Group>
                    )}
                    <Contacts contacts={currentUser?.candidate?.info?.contacts} />
                    <Group mb='var(--size-xl)'>
                        <Button
                            leftSection={<FileText weight='bold' size={20} />}
                            onClick={() => {
                                // downloadFile(currentUser?.candidate?.id ?? '');
                                download(currentUser?.candidate?.id ?? '');
                            }}
                            variant='light'
                        >
                            Резюме
                        </Button>
                        <Button bg='gray.2' c='black' leftSection={<ChatDots weight='bold' size={20} />}>
                            В чат
                        </Button>
                    </Group>
                    <AISummary summary={currentUser?.candidate?.info?.ai_summary} />
                    <AIQuestions questions={currentUser?.candidate?.info?.personalized_questions} />
                </Stack>
            </Stack>
        </Paper>
    );
};
