import { useEffect } from 'react';
import { Button, Flex } from '@mantine/core';
import { randomId } from '@mantine/hooks';
import { zodResolver } from 'mantine-form-zod-resolver';

import { useChangeMeInfoMutation, useGenerateSheduleMutation } from '@/services';
import { FormContainer } from '@/shared/ui';
import { AutoGenerateTimeSlotsSchema } from '@/shared/validate';

import { AutoGenerateTimeSlotsFormProvider, useAutoGenerateTimeSlotsForm } from './model';
import { SelectInput, TimeInput } from './ui';

interface AutoGenerateTimeSlotsProps {
    close: any;
    handleGenerateSlot: (data: Array<{ start_time: string; end_time: string }>) => void;
}

export const AutoGenerateTimeSlots = ({ close, handleGenerateSlot }: AutoGenerateTimeSlotsProps) => {
    const form = useAutoGenerateTimeSlotsForm({
        mode: 'uncontrolled',
        name: 'auto-generate-form',
        initialValues: {
            start_date: {
                name: null,
                key: randomId(),
            },
            end_date: {
                name: null,
                key: randomId(),
            },
            session_duration: { name: '30', key: randomId() },
            gap_duration: { name: '0', key: randomId() },
        },
        validate: zodResolver(AutoGenerateTimeSlotsSchema),
    });

    const [generateShedule, { data, isSuccess }] = useGenerateSheduleMutation();

    const onSubmit = form.onSubmit((values) => {
        generateShedule({
            start_time: values.start_date.name,
            end_time: values.end_date.name,
            session_duration: Number(values.session_duration.name),
            gap_duration: Number(values.gap_duration.name),
        });
    });

    const handleCancel = () => {
        close();
    };

    useEffect(() => {
        if (isSuccess) {
            handleGenerateSlot(data);
            close();
        }
    }, [isSuccess]);

    return (
        <AutoGenerateTimeSlotsFormProvider form={form}>
            <FormContainer py={0} px={0} id='auto-generate-form' onSubmit={onSubmit}>
                <Flex direction='column'>
                    <Flex direction='column' gap='xl' w={296}>
                        <TimeInput label='Начало рабочего времени' name='start_date' />
                        <TimeInput label='Окончание рабочего времени' name='end_date' />
                        <SelectInput
                            data={['30', '60', '90', '120']}
                            name='session_duration'
                            label='Длительность интервью'
                            placeholder='Выберите из списка'
                        />
                        <SelectInput
                            data={['0', '15', '30', '45', '60']}
                            name='gap_duration'
                            label='Перерыв между интервью'
                            placeholder='Выберите из списка'
                        />
                    </Flex>
                    <Flex gap='xl' pt='xl'>
                        <Button variant='outline' type='reset' onClick={handleCancel}>
                            Отмена
                        </Button>
                        <Button variant='light' type='submit'>
                            Сохранить
                        </Button>
                    </Flex>
                </Flex>
            </FormContainer>
        </AutoGenerateTimeSlotsFormProvider>
    );
};
