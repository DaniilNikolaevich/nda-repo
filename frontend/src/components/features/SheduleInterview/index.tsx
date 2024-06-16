import { useEffect } from 'react';
import { Button, Drawer, Flex, Text, Title, Tooltip } from '@mantine/core';
import { randomId, useDisclosure } from '@mantine/hooks';
import { Minus } from '@phosphor-icons/react/dist/ssr/Minus';
import { PlusCircle } from '@phosphor-icons/react/dist/ssr/PlusCircle';
import { Prohibit } from '@phosphor-icons/react/dist/ssr/Prohibit';
import { TrashSimple } from '@phosphor-icons/react/dist/ssr/TrashSimple';
import { zodResolver } from 'mantine-form-zod-resolver';

import { AutoGenerateTimeSlots } from '@/components/features';
import {
    useChangeWeeklySheduleMutation,
    useCreateWeeklySheduleMutation,
    useGetInfoRecruiterByMeQuery,
    useGetViewSheduleQuery,
} from '@/services';
import { SheduleRequestType } from '@/shared/types/common-models/Calendar';
import { FormContainer } from '@/shared/ui';
import { SheduleInterviewSchema } from '@/shared/validate';

import { SheduleInterviewFormProvider, useSheduleInterviewForm } from './model';
import { TimeInput } from './ui';

type FieldKeysType = 'monday' | 'tuesday' | 'thursday' | 'wednesday' | 'friday' | 'saturday' | 'sunday';

export const SheduleInterview = () => {
    const [opened, { open, close }] = useDisclosure(false);

    const form = useSheduleInterviewForm({
        mode: 'uncontrolled',
        name: 'shedule-interview-form',
        initialValues: {
            monday: [
                {
                    start_date: { name: null, key: randomId() },
                    end_date: { name: null, key: randomId() },
                    disabled: false,
                    numOfDay: 0,
                },
            ],
            tuesday: [
                {
                    start_date: { name: null, key: randomId() },
                    end_date: { name: null, key: randomId() },
                    disabled: false,
                    numOfDay: 1,
                },
            ],
            wednesday: [
                {
                    start_date: { name: null, key: randomId() },
                    end_date: { name: null, key: randomId() },
                    disabled: false,
                    numOfDay: 2,
                },
            ],
            thursday: [
                {
                    start_date: { name: null, key: randomId() },
                    end_date: { name: null, key: randomId() },
                    disabled: false,
                    numOfDay: 3,
                },
            ],
            friday: [
                {
                    start_date: { name: null, key: randomId() },
                    end_date: { name: null, key: randomId() },
                    disabled: false,
                    numOfDay: 4,
                },
            ],
            saturday: [
                {
                    start_date: { name: null, key: randomId() },
                    end_date: { name: null, key: randomId() },
                    disabled: false,
                    numOfDay: 5,
                },
            ],
            sunday: [
                {
                    start_date: { name: null, key: randomId() },
                    end_date: { name: null, key: randomId() },
                    disabled: false,
                    numOfDay: 6,
                },
            ],
        },
        validate: zodResolver(SheduleInterviewSchema),
    });

    const { data } = useGetInfoRecruiterByMeQuery();
    const { data: viewShedule } = useGetViewSheduleQuery(
        {
            recruiter_id: data?.user?.id ?? '',
        },
        {
            skip: !data?.user?.id,
            refetchOnMountOrArgChange: true,
        }
    );

    const [createWeeklyShedule] = useCreateWeeklySheduleMutation();
    const [changeWeeklyShedule] = useChangeWeeklySheduleMutation();

    useEffect(() => {
        if (viewShedule && viewShedule?.length > 0) {
            form.initialize({
                monday: viewShedule
                    .find((item) => item?.weekday?.id === 0)
                    ?.schedule_slots?.map(({ start_time, end_time }) => ({
                        start_date: { name: start_time, key: randomId() },
                        end_date: { name: end_time, key: randomId() },
                        disabled: false,
                        numOfDay: 0,
                    })) ?? [
                    {
                        start_date: { name: null, key: randomId() },
                        end_date: { name: null, key: randomId() },
                        disabled: true,
                        numOfDay: 0,
                    },
                ],
                tuesday: viewShedule
                    .find((item) => item?.weekday?.id === 1)
                    ?.schedule_slots?.map(({ start_time, end_time }) => ({
                        start_date: { name: start_time, key: randomId() },
                        end_date: { name: end_time, key: randomId() },
                        disabled: false,
                        numOfDay: 1,
                    })) ?? [
                    {
                        start_date: { name: null, key: randomId() },
                        end_date: { name: null, key: randomId() },
                        disabled: true,
                        numOfDay: 1,
                    },
                ],
                wednesday: viewShedule
                    .find((item) => item?.weekday?.id === 2)
                    ?.schedule_slots?.map(({ start_time, end_time }) => ({
                        start_date: { name: start_time, key: randomId() },
                        end_date: { name: end_time, key: randomId() },
                        disabled: false,
                        numOfDay: 2,
                    })) ?? [
                    {
                        start_date: { name: null, key: randomId() },
                        end_date: { name: null, key: randomId() },
                        disabled: true,
                        numOfDay: 2,
                    },
                ],
                thursday: viewShedule
                    .find((item) => item?.weekday?.id === 3)
                    ?.schedule_slots?.map(({ start_time, end_time }) => ({
                        start_date: { name: start_time, key: randomId() },
                        end_date: { name: end_time, key: randomId() },
                        disabled: false,
                        numOfDay: 3,
                    })) ?? [
                    {
                        start_date: { name: null, key: randomId() },
                        end_date: { name: null, key: randomId() },
                        disabled: true,
                        numOfDay: 3,
                    },
                ],
                friday: viewShedule
                    .find((item) => item?.weekday?.id === 4)
                    ?.schedule_slots?.map(({ start_time, end_time }) => ({
                        start_date: { name: start_time, key: randomId() },
                        end_date: { name: end_time, key: randomId() },
                        disabled: false,
                        numOfDay: 4,
                    })) ?? [
                    {
                        start_date: { name: null, key: randomId() },
                        end_date: { name: null, key: randomId() },
                        disabled: true,
                        numOfDay: 4,
                    },
                ],
                saturday: viewShedule
                    .find((item) => item?.weekday?.id === 5)
                    ?.schedule_slots?.map(({ start_time, end_time }) => ({
                        start_date: { name: start_time, key: randomId() },
                        end_date: { name: end_time, key: randomId() },
                        disabled: false,
                        numOfDay: 5,
                    })) ?? [
                    {
                        start_date: { name: null, key: randomId() },
                        end_date: { name: null, key: randomId() },
                        disabled: true,
                        numOfDay: 5,
                    },
                ],
                sunday: viewShedule
                    .find((item) => item?.weekday?.id === 6)
                    ?.schedule_slots?.map(({ start_time, end_time }) => ({
                        start_date: { name: start_time, key: randomId() },
                        end_date: { name: end_time, key: randomId() },
                        disabled: false,
                        numOfDay: 6,
                    })) ?? [
                    {
                        start_date: { name: null, key: randomId() },
                        end_date: { name: null, key: randomId() },
                        disabled: true,
                        numOfDay: 6,
                    },
                ],
            });
        }
    }, [viewShedule]);

    const onSubmit = form.onSubmit((values) => {
        const obj = Object.entries(values).map(([key, item]) => item);
        const dataValues: Record<string, SheduleRequestType> = obj.reduce(
            (acc, cur) => {
                acc[`${cur[0].numOfDay}`] = {
                    is_day_off: cur[0].disabled,
                    weekday: cur[0].numOfDay,
                    schedule_slots: cur
                        .filter((element) => element.start_date.name && element.end_date.name)
                        .map((el) => ({
                            start_time: el.start_date.name,
                            end_time: el.end_date.name,
                        })),
                };
                return acc;
            },
            {} as Record<string, SheduleRequestType>
        );

        if (viewShedule && viewShedule?.length > 0) {
            changeWeeklyShedule({
                recruiter_id: data?.user.id ?? '',
                shedules: Object.values(dataValues),
            });
            return;
        }

        createWeeklyShedule({
            recruiter_id: data?.user.id ?? '',
            shedules: Object.values(dataValues),
        });
    });

    const handleDayoffSlot = (slot: FieldKeysType) => {
        form.setFieldValue(slot, [
            {
                ...form.getValues()[slot][0],
                start_date: { name: null, key: randomId() },
                end_date: { name: null, key: randomId() },
                disabled: true,
            },
        ]);
    };

    const handleDeleteSlot = (slot: FieldKeysType, index: number) => {
        const tempValues = form.getValues()[slot];
        tempValues.splice(index, 1);
        form.setFieldValue(slot, [...tempValues]);
    };

    const handleAddNewSlot = (slot: FieldKeysType) => {
        if (form.getValues()[slot][0].disabled) {
            form.setFieldValue(slot, [
                {
                    ...form.getValues()[slot][0],
                    start_date: { name: null, key: randomId() },
                    end_date: { name: null, key: randomId() },
                    disabled: false,
                },
            ]);

            return;
        }

        form.insertListItem(slot, {
            ...form.getValues()[slot][0],
            start_date: { name: null, key: randomId() },
            end_date: { name: null, key: randomId() },
            disabled: false,
        });
    };

    const fields = (key: FieldKeysType) =>
        form.getValues()?.[key].map((item, index) => (
            <Flex key={randomId()} gap={8} align='center'>
                <TimeInput index={index} placeholder='00:00' item={key} name='start_date' />
                <Minus size={16} />
                <TimeInput index={index} placeholder='00:00' item={key} name='end_date' />
                {index < form.getValues()?.[key].length - 1 && (
                    <Button w={34} h={34} p={0} variant='white' onClick={() => handleDeleteSlot(key, index)}>
                        <Tooltip label='Удалить'>
                            <TrashSimple size={16} />
                        </Tooltip>
                    </Button>
                )}
                {index === form.getValues()?.[key].length - 1 && (
                    <Flex gap={4}>
                        <Button w={34} h={34} p={0} variant='white' onClick={() => handleDayoffSlot(key)}>
                            <Tooltip label='Выходной'>
                                <Prohibit size={16} />
                            </Tooltip>
                        </Button>
                        <Button w={34} h={34} p={0} variant='white' onClick={() => handleAddNewSlot(key)}>
                            <Tooltip label='Добавить слот'>
                                <PlusCircle size={16} />
                            </Tooltip>
                        </Button>
                    </Flex>
                )}
            </Flex>
        ));

    const handleAutoGenerate = () => {
        open();
    };

    const handleGenerateSlot = (data: Array<{ start_time: string; end_time: string }>) => {
        form.setValues({
            monday: data.map(({ start_time, end_time }) => ({
                start_date: { name: start_time, key: randomId() },
                end_date: { name: end_time, key: randomId() },
                disabled: false,
                numOfDay: 0,
            })),
            tuesday: data.map(({ start_time, end_time }) => ({
                start_date: { name: start_time, key: randomId() },
                end_date: { name: end_time, key: randomId() },
                disabled: false,
                numOfDay: 1,
            })),
            wednesday: data.map(({ start_time, end_time }) => ({
                start_date: { name: start_time, key: randomId() },
                end_date: { name: end_time, key: randomId() },
                disabled: false,
                numOfDay: 2,
            })),
            thursday: data.map(({ start_time, end_time }) => ({
                start_date: { name: start_time, key: randomId() },
                end_date: { name: end_time, key: randomId() },
                disabled: false,
                numOfDay: 3,
            })),
            friday: data.map(({ start_time, end_time }) => ({
                start_date: { name: start_time, key: randomId() },
                end_date: { name: end_time, key: randomId() },
                disabled: false,
                numOfDay: 4,
            })),
            saturday: data.map(({ start_time, end_time }) => ({
                start_date: { name: start_time, key: randomId() },
                end_date: { name: end_time, key: randomId() },
                disabled: false,
                numOfDay: 5,
            })),
            sunday: data.map(({ start_time, end_time }) => ({
                start_date: { name: start_time, key: randomId() },
                end_date: { name: end_time, key: randomId() },
                disabled: false,
                numOfDay: 6,
            })),
        });
    };

    const renderTimeItem = (item: FieldKeysType) => (
        <Flex gap={8} align='flex-end'>
            <Flex direction='column' gap={16}>
                {fields(item)}
            </Flex>
        </Flex>
    );

    const slots = viewShedule?.filter((item) => Boolean(item.schedule_slots));

    return (
        <>
            <SheduleInterviewFormProvider form={form}>
                <FormContainer py={0} px={0} id='shedule-interview-form' onSubmit={onSubmit}>
                    <Flex w='fit-content' direction='column' justify='space-between' align='flex-end' gap={40}>
                        <Flex direction='column' gap='xl'>
                            <Text size='md'>
                                Вы можете заполнить поля вручную или сгенерировать расписание автоматически.
                            </Text>
                            <Flex gap={16}>
                                <Text fw={600}>Пн</Text>
                                {renderTimeItem('monday')}
                            </Flex>
                            <Flex gap={16}>
                                <Text fw={600}>Вт</Text>
                                {renderTimeItem('tuesday')}
                            </Flex>
                            <Flex gap={16}>
                                <Text fw={600}>Ср</Text>
                                {renderTimeItem('wednesday')}
                            </Flex>
                            <Flex gap={16}>
                                <Text fw={600}>Чт</Text>
                                {renderTimeItem('thursday')}
                            </Flex>
                            <Flex gap={16}>
                                <Text fw={600}>Пт</Text>
                                {renderTimeItem('friday')}
                            </Flex>
                            <Flex gap={16}>
                                <Text fw={600}>Сб</Text>
                                {renderTimeItem('saturday')}
                            </Flex>
                            <Flex gap={16}>
                                <Text fw={600}>Вс</Text>
                                {renderTimeItem('sunday')}
                            </Flex>
                        </Flex>
                        {(slots && slots?.length > 0) || form.isDirty() ? (
                            <Flex gap='xl' pt='xl'>
                                <Button variant='outline' type='reset'>
                                    Отмена
                                </Button>
                                <Button variant='light' type='submit'>
                                    Сохранить
                                </Button>
                            </Flex>
                        ) : (
                            <Flex gap='xl' pt='xl'>
                                <Button onClick={handleAutoGenerate}>Сгенерировать автоматически</Button>
                            </Flex>
                        )}
                    </Flex>
                </FormContainer>
            </SheduleInterviewFormProvider>
            <Drawer
                opened={opened}
                position='right'
                onClose={close}
                title={<Title order={3}>Заполните параметры</Title>}
            >
                <AutoGenerateTimeSlots handleGenerateSlot={handleGenerateSlot} close={close} />
            </Drawer>
        </>
    );
};
