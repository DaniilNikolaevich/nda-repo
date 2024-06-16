import { Button, Divider, Flex, Paper, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Link } from '@phosphor-icons/react/dist/ssr/Link';
import dayjs from 'dayjs';

import { useSelectedVacancy } from '@/components/widgets/RecruitingProcess/model/useSelectedVacancy';
import { History } from '@/components/widgets/RecruitingProcess/ui/History';
import { RecruitersComments } from '@/components/widgets/RecruitingProcess/ui/RecruitersComments';
import { StatusChanger } from '@/components/widgets/RecruitingProcess/ui/StatusChanger';
import { useDeclineInterviewByRecruiterMutation, useInviteCandidateOnInterviewMutation } from '@/services';

export const VacanciesStatusScreen = () => {
    const [inviteCandidate] = useInviteCandidateOnInterviewMutation();
    const [declineInterview] = useDeclineInterviewByRecruiterMutation();
    const { selectedProcessUser, interviewStatus } = useSelectedVacancy();

    const onInviteCandidateHandler = () => {
        if (!selectedProcessUser) return;
        try {
            inviteCandidate(selectedProcessUser).unwrap();
            notifications.show({
                title: 'Успешно!',
                message: 'Кандидат приглашен на интервью',
            });
        } catch (e) {
            if (e instanceof Error) {
                console.error(e.message);
            }
            notifications.show({
                color: 'red',
                title: 'Ошибка!',
                message: 'Произошла ошибка',
            });
        }
    };

    const onCancelInterview = () => {
        if (!interviewStatus?.id) return;
        try {
            declineInterview({ interview: interviewStatus?.id }).unwrap();
            notifications.show({
                title: 'Успешно!',
                message: 'Приглашение отменено',
            });
        } catch (e) {
            if (e instanceof Error) {
                console.error(e.message);
            }
            notifications.show({
                color: 'red',
                title: 'Ошибка!',
                message: 'Произошла ошибка',
            });
        }
    };

    const renderControls = () => {
        // Ожидает приглашения
        if (interviewStatus?.status.id === 0) {
            return (
                <Button w='fit-content' c='indigo.8' bg='indigo.1' onClick={onInviteCandidateHandler}>
                    Отправить приглашение
                </Button>
            );
        }
        // Ожидание выбора времени
        if (interviewStatus?.status.id === 1) {
            return (
                <Button w='fit-content' c='red.8' bg='red.1' onClick={onCancelInterview}>
                    Отменить приглашение
                </Button>
            );
        }

        return null;
    };

    const renderStatus = () => {
        // Ожидание приглашения
        if (interviewStatus?.status.id === 0) {
            return (
                <Text fw={600} fz={18}>
                    Ожидание приглашения на интервью
                </Text>
            );
        }
        // Ожидание выбора времени
        if (interviewStatus?.status.id === 1) {
            return (
                <Text fw={600} fz={18}>
                    Ожидание выбора времени кандидатом
                </Text>
            );
        }
        if (interviewStatus?.status.id === 4) {
            return (
                <Text fw={600} fz={18} c='red.6'>
                    Отменено рекрутером
                </Text>
            );
        }
    };

    const renderMeetingLink = () => {
        if (interviewStatus?.meeting_link && interviewStatus?.start_time) {
            return (
                <Flex direction='column' gap='var(--size-sm)'>
                    <Text fw='bold'>Интервью назначено.</Text>
                    <Text fw='bold'>
                        {dayjs(interviewStatus?.date).format('DD.MM.YYYY')}, {interviewStatus?.start_time}
                    </Text>
                    <Button
                        component='a'
                        target='_blank'
                        variant='subtle'
                        href={interviewStatus?.meeting_link}
                        leftSection={<Link weight='bold' />}
                        w='fit-content'
                    >
                        Ссылка на встречу
                    </Button>
                </Flex>
            );
        }
    };

    return (
        <Paper w='100%'>
            <Stack gap={12}>
                <Flex justify='space-between' align='center'>
                    <Text fw={600} fz={18}>
                        Статус
                    </Text>
                    <StatusChanger />
                </Flex>
                <Stack>
                    {renderMeetingLink()}
                    {renderStatus()}
                    {renderControls()}
                </Stack>
                <Divider my={20} />
            </Stack>
            <RecruitersComments />
            <History />
        </Paper>
    );
};
