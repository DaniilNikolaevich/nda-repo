import { useEffect, useState } from 'react';
import { Radio, Stack } from '@mantine/core';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';

export const VacanciesPeriodFilter = () => {
    const searchParams = useSearchParams();
    const { replace, pathname } = useRouter();
    const [value, setValue] = useState('');

    const onChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            setValue(value);
            params.set('date_range', `${value}`);
        } else {
            setValue('');
            params.delete('date_range');
        }
        replace(`${pathname}?${params.toString()}`, `${pathname}?${params.toString()}`, {
            scroll: false,
        });
    };

    useEffect(() => {
        if (searchParams) {
            setValue(searchParams.get('date_range') ?? '');
        }
    }, [searchParams]);

    return (
        <Radio.Group name='date_range' label='Период размещения' value={value} onChange={onChange}>
            <Stack gap='var(--size-sm)'>
                <Radio value='' label='За все время' />
                <Radio value='last_month' label='За месяц' />
                <Radio value='last_week' label='За неделю' />
                <Radio value='last_day' label='За сутки' />
            </Stack>
        </Radio.Group>
    );
};
