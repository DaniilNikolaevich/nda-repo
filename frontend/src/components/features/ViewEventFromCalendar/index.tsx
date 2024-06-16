import { Flex, NavLink, Text, Title } from '@mantine/core';
import { Link } from '@phosphor-icons/react/dist/ssr/Link';
import dayjs from 'dayjs';

import { useGetViewAdminBookingByIdQuery } from '@/services';

interface ViewEventFromCalendarProps {
    event_id?: string | null;
}

export const ViewEventFromCalendar = ({ event_id }: ViewEventFromCalendarProps) => {
    const { data: currentEvent } = useGetViewAdminBookingByIdQuery(
        {
            event_id: event_id ?? '',
        },
        {
            skip: !event_id,
            refetchOnMountOrArgChange: true,
        }
    );

    if (!currentEvent) {
        return null;
    }

    return (
        <Flex direction='column' gap={20}>
            <Title order={5}>Интервью</Title>
            <Flex direction='column' gap={12}>
                <Text fw={600}>Дата и время</Text>
                <Text>{dayjs(currentEvent.start_datetime).format('DD.MM.YYYY, HH:mm')}</Text>
                {currentEvent.meeting_url && (
                    <NavLink
                        href={currentEvent.meeting_url}
                        label={currentEvent.meeting_url}
                        target='_blank'
                        leftSection={<Link size={20} />}
                    />
                )}
            </Flex>
            <Flex direction='column' gap={12}>
                <Text fw={600}>Соискатель</Text>
                <Text>{currentEvent.candidate?.fullname ?? ''}</Text>
            </Flex>
            {currentEvent.candidate?.user?.preferred_position && (
                <Flex direction='column' gap={12}>
                    <Text fw={600}>Должность</Text>
                    <Text>{currentEvent.candidate?.user?.preferred_position}</Text>
                </Flex>
            )}
        </Flex>
    );
};
