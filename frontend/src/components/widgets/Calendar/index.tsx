import { MouseEvent, useEffect, useState } from 'react';
import { DateSelectArg, DatesSetArg, EventSourceInput } from '@fullcalendar/core';
import { Identity } from '@fullcalendar/core/internal';
import allLocales from '@fullcalendar/core/locales-all';
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Box, Button, Drawer, Flex, Input, Modal, Text, Title } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { Clock } from '@phosphor-icons/react/dist/ssr/Clock';
import { HTMLElement } from '@tiptap/core';
import dayjs from 'dayjs';

import { SheduleInterview, ViewEventFromCalendar } from '@/components/features';
import { useGetInfoRecruiterByMeQuery, useGetViewAdminBookingQuery, useGetViewSheduleQuery } from '@/services';

import s from './Calendar.module.css';

export const Calendar = () => {
    const [opened, { open, close }] = useDisclosure(false);
    const [isSettingsShedule, setIsSettingsShedule] = useState(false);

    const { data: recruiterInfoMe } = useGetInfoRecruiterByMeQuery();
    const { data: adminBookings } = useGetViewAdminBookingQuery();
    const { data: shedules } = useGetViewSheduleQuery(
        {
            recruiter_id: recruiterInfoMe?.user?.id ?? '',
        },
        {
            skip: !recruiterInfoMe?.user?.id,
            refetchOnMountOrArgChange: true,
        }
    );

    const [events, setEvents] = useState<EventSourceInput>([]);
    const [eventId, setEventId] = useState<string | null>(null);

    const handleSettingsShedule = () => {
        open();
        setIsSettingsShedule(true);
    };

    const handleViewEvent = (e: any) => {
        setEventId(e.event.id);
        open();
        setIsSettingsShedule(false);
    };

    const eventContent = (arg: any) => (
        <Flex direction='column' p={4} style={{ background: '#EDF2FF', color: 'black' }}>
            <Text size='sm' fw={600} lineClamp={1}>
                {dayjs(arg.event.startStr).format('HH:mm')}&nbsp;Интервью
            </Text>
            <Text size='sm' lineClamp={1}>
                {arg.event.extendedProps.fullname}
            </Text>
            <Text size='sm' lineClamp={1}>
                Frontend - разработчик Junior
            </Text>
        </Flex>
    );

    useEffect(() => {
        if (adminBookings) {
            setEvents(
                adminBookings.payload?.map(({ id, start_datetime, candidate, end_datetime }) => ({
                    id,
                    title: 'Интервью',
                    fullname: candidate.fullname,
                    start: start_datetime,
                    end: end_datetime,
                }))
            );
        }
    }, [adminBookings]);

    return (
        <div className={s.root}>
            <FullCalendar
                plugins={[interactionPlugin, timeGridPlugin, dayGridPlugin]}
                eventClassNames={s.eventInfo}
                eventClick={handleViewEvent}
                selectable={true}
                eventContent={eventContent}
                initialView='timeGridWeek'
                events={events}
                weekends={false}
                locales={allLocales}
                locale='ru'
                selectOverlap={(event) => false}
                headerToolbar={{
                    left: 'prev,next',
                    center: 'title',
                    right: 'settingsShedule timeGridDay,timeGridWeek,dayGridMonth',
                }}
                customButtons={{
                    settingsShedule: {
                        text: 'Настроить расписание',
                        click: handleSettingsShedule,
                    },
                }}
                dayHeaderContent={(args) => dayjs(args.date).format('dd')}
                allDaySlot={false}
                slotMinTime='07:00:00'
                slotMaxTime='21:00:00'
                slotLabelFormat={{ hour: 'numeric', minute: '2-digit' }}
            />
            <Drawer
                opened={opened}
                position='right'
                onClose={close}
                title={<Title order={3}>{isSettingsShedule ? 'Расписание интервью' : 'Событие'}</Title>}
            >
                {isSettingsShedule ? <SheduleInterview /> : <ViewEventFromCalendar event_id={eventId} />}
            </Drawer>
        </div>
    );
};
