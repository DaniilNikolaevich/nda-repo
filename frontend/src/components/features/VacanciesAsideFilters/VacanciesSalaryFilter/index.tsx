import { useEffect, useState } from 'react';
import { NumberFormatter, Radio, Stack } from '@mantine/core';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';

export const VacanciesSalaryFilter = () => {
    const searchParams = useSearchParams();
    const { replace, pathname } = useRouter();
    const [value, setValue] = useState('');

    const onSalaryChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            setValue(value);
            params.set('salary__gte', `${value}`);
        } else {
            setValue('');
            params.delete('salary__gte');
        }
        replace(`${pathname}?${params.toString()}`, `${pathname}?${params.toString()}`, {
            scroll: false,
        });
    };

    useEffect(() => {
        if (searchParams) {
            setValue(searchParams.get('salary__gte') ?? '');
        }
    }, [searchParams]);

    return (
        <Radio.Group name='salary' label='Зарплата, ₽' value={value} onChange={onSalaryChange}>
            <Stack gap='var(--size-sm)'>
                <Radio value='' label='Все' />
                <Radio value='100000' label={<NumberFormatter prefix='от ' thousandSeparator=' ' value={100000} />} />
                <Radio value='200000' label={<NumberFormatter prefix='от ' thousandSeparator=' ' value={200000} />} />
                <Radio value='250000' label={<NumberFormatter prefix='от ' thousandSeparator=' ' value={250000} />} />
                <Radio value='350000' label={<NumberFormatter prefix='от ' thousandSeparator=' ' value={350000} />} />
            </Stack>
        </Radio.Group>
    );
};
