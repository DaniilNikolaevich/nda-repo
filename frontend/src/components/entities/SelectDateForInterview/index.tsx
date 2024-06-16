import { useEffect, useState } from 'react';
import { Box, Button, Flex, Loader, Popover, Text, TextInput, Title } from '@mantine/core';
import { Calendar, DateInput } from '@mantine/dates';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr/CalendarBlank';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import qs from 'query-string';

import s from '@/components/widgets/GenerallyDataForm/ui/BornInput/BurnInput.module.css';
import {
    useAvailableDatesForInterviewQuery,
    useAvailableSlotBySelectedDateQuery,
    useDeclinedDatesForInterviewMutation,
    useSelectDateSlotFlowMutation,
} from '@/services';

export const SelectDateForInterview = () => {
    const {
        pathname,
        replace,
        query: { interview_id },
    } = useRouter();

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [popoverOpened, setPopoverOpened] = useState(false);
    const [slot, setSlot] = useState<{ id: string; start_time: string; end_time: string } | null>(null);
    const date = qs.stringify({ date: [dayjs().format('MM-YYYY'), dayjs().add(1, 'month').format('MM-YYYY')] });

    const [selectDateForInterview, { isSuccess, isLoading, isError }] = useSelectDateSlotFlowMutation();

    const { data: availableSlots, isFetching: isFetchingAvailableSlots } = useAvailableSlotBySelectedDateQuery(
        {
            interview_id: (interview_id as string) ?? '',
            date: dayjs(selectedDate).format('YYYY-MM-DD') ?? '',
        },
        {
            skip: !interview_id || !selectedDate,
        }
    );
    const { data: availableDate } = useAvailableDatesForInterviewQuery(
        {
            interview_id: (interview_id as string) ?? '',
            date,
        },
        {
            skip: !interview_id,
        }
    );
    const [declineInterview] = useDeclinedDatesForInterviewMutation();

    const handleDeclineDate = () => {
        declineInterview({
            interview: (interview_id as string) ?? '',
        });
    };

    const handleRequestSlot = () => {
        selectDateForInterview({
            interview_date: selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : '',
            interview: (interview_id as string) ?? '',
            time_slot: slot?.id ?? '',
        });
    };

    const handleSelectDate = (slot: { id: string; start_time: string; end_time: string }) => {
        setSlot(slot);
    };

    const handleDateChange = (date: Date | null) => {
        setSelectedDate(date);
        setPopoverOpened(false);
    };

    useEffect(() => {
        if (isSuccess) {
            replace(pathname + `/selected-time?interview_id=${interview_id}`);
        }
    }, [isSuccess, interview_id]);

    if (isLoading) {
        return (
            <Flex pt={20} justify='center' align='center'>
                <Loader />
            </Flex>
        );
    }

    return (
        <Flex p={20} gap={40} bg='white' m='auto' direction='column' miw={870} maw={870} style={{ borderRadius: 16 }}>
            <Flex direction='column' gap={20}>
                <Title order={3}>Выбор даты интервью</Title>
                <Box w={320}>
                    <Popover opened={popoverOpened} onClose={() => setPopoverOpened(false)}>
                        <Popover.Target>
                            <TextInput
                                value={selectedDate ? dayjs(selectedDate).format('DD.MM.YYYY') : ''}
                                onClick={() => setPopoverOpened(true)}
                                readOnly
                                placeholder='Выберите дату'
                            />
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Calendar
                                excludeDate={(date) => !availableDate?.includes(dayjs(date).format('YYYY-MM-DD'))}
                                getDayProps={(date) => ({
                                    onClick: () => handleDateChange(date),
                                })}
                                style={{ maxWidth: 300 }} // Можно настроить стили календаря
                            />
                        </Popover.Dropdown>
                    </Popover>
                </Box>
            </Flex>
            <Flex direction='column' gap={20}>
                <Title order={3}>Выбор времени интервью</Title>
                {selectedDate ? (
                    <>
                        {isFetchingAvailableSlots ? (
                            <Text style={{ fontSize: 18, color: '#909296' }}>Загружаем свободное время...</Text>
                        ) : (
                            <Flex wrap='wrap' w={280} gap={12}>
                                {availableSlots && availableSlots?.length && availableSlots?.length > 0 ? (
                                    availableSlots.map((slottt) => (
                                        <Button
                                            key={slottt.id}
                                            variant={slot?.id === slottt.id ? 'filled' : 'outline'}
                                            onClick={() => handleSelectDate(slottt)}
                                        >
                                            {slottt.start_time}
                                        </Button>
                                    ))
                                ) : (
                                    <Text style={{ fontSize: 18, color: '#909296' }}>Доступные слоты отсутствуют</Text>
                                )}
                            </Flex>
                        )}
                    </>
                ) : (
                    <Text style={{ fontSize: 18, color: '#909296' }}>Сначала выберите дату</Text>
                )}
            </Flex>
            <Flex justify='space-between' align='center'>
                <Button onClick={handleRequestSlot}>Выбрать</Button>
                <Button variant='light' color='red' onClick={handleDeclineDate}>
                    Отказаться от интервью
                </Button>
            </Flex>
        </Flex>
    );
};
