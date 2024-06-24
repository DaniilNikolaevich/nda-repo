import { useEffect } from 'react';
import { Button, Flex, Group, NumberFormatter, Paper, Stack, Text, Title } from '@mantine/core';
import { ArrowSquareOut } from '@phosphor-icons/react/dist/ssr/ArrowSquareOut';
import { ChatDots } from '@phosphor-icons/react/dist/ssr/ChatDots';
import { FileText } from '@phosphor-icons/react/dist/ssr/FileText';
import { isNull } from 'lodash-es';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { useLazyDownloadResumeQuery } from '@/services';
import { useCreateChatWithCandidate } from '@/services/RecruiterService/hooks';

import { useSelectedVacancy } from '../../model/useSelectedVacancy';
import { AIQuestions } from './AIQuestions';
import { AISummary } from './AISummary';
import { Contacts } from './Contacts';

export const VacancyMainScreen = () => {
    const router = useRouter();
    const { filteredProcessModel, selectedProcessUser } = useSelectedVacancy();

    const hasChat = !isNull(filteredProcessModel?.[0].chat);

    const { handleCreateChat, chatInfo } = useCreateChatWithCandidate();

    const [download, { data }] = useLazyDownloadResumeQuery();
    const currentUser = filteredProcessModel?.find((el) => el.id === selectedProcessUser);

    const onChatHandler = () => {
        if (!filteredProcessModel) return;
        handleCreateChat(filteredProcessModel?.[0]?.candidate.id);
    };

    useEffect(() => {
        if (!chatInfo?.chat_id) return;

        router.push(`/chats?chatId=${chatInfo?.chat_id}`);
    }, [chatInfo?.chat_id]);

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
                            variant='light'
                            leftSection={<FileText weight='bold' size={20} />}
                            onClick={() => download(currentUser?.candidate?.id ?? '')}
                        >
                            Резюме
                        </Button>
                        {hasChat && (
                            <Button
                                c='black'
                                bg='gray.2'
                                component={Link}
                                href={`/chats?chatId=${filteredProcessModel[0].chat}`}
                                leftSection={<ChatDots weight='bold' size={20} />}
                            >
                                В чат
                            </Button>
                        )}
                        {!hasChat && (
                            <Button
                                c='black'
                                bg='gray.2'
                                onClick={onChatHandler}
                                leftSection={<ChatDots weight='bold' size={20} />}
                            >
                                В чат
                            </Button>
                        )}
                    </Group>
                    <AISummary summary={currentUser?.candidate?.info?.ai_summary} />
                    <AIQuestions questions={currentUser?.candidate?.info?.personalized_questions} />
                </Stack>
            </Stack>
        </Paper>
    );
};
