import { Button, Flex, Group, NumberFormatter, Paper, Stack, Text, Title } from '@mantine/core';
import { ArrowSquareOut } from '@phosphor-icons/react/dist/ssr/ArrowSquareOut';
import Link from 'next/link';

import { useSelectedVacancy } from '../../model/useSelectedVacancy';
import { AIQuestions } from './AIQuestions';
import { AISummary } from './AISummary';
import { Contacts } from './Contacts';
import { Controls } from './Controls';

export const VacancyMainScreen = () => {
    const { filteredProcessModel, selectedProcessUser } = useSelectedVacancy();

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
                    <Controls />
                    <AISummary summary={currentUser?.candidate?.info?.ai_summary} />
                    <AIQuestions questions={currentUser?.candidate?.info?.personalized_questions} />
                </Stack>
            </Stack>
        </Paper>
    );
};
