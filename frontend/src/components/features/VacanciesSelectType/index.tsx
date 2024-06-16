import { useEffect, useState } from 'react';
import { type ComboboxItem, Select } from '@mantine/core';
import { CaretDown } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';

const TYPES = [
    {
        label: 'По соответствию',
        value: '0',
    },
    {
        label: 'По дате размещения',
        value: '1',
    },
    {
        label: 'По убыванию зарплаты',
        value: '2',
    },
    {
        label: 'По возрастанию зарплаты',
        value: '3',
    },
];

export const VacanciesSelectType = () => {
    const searchParams = useSearchParams();
    const { pathname, replace } = useRouter();
    const [value, setValue] = useState<ComboboxItem | null>(TYPES[0]);

    const onChange = (newValue: ComboboxItem) => {
        const params = new URLSearchParams(searchParams);

        if (newValue?.value === value?.value) return;

        setValue(newValue);
        if (newValue?.value === '0') {
            params.set('sortBy', '');
            params.set('sortDesc', 'false');
        }
        if (newValue?.value === '1') {
            params.set('sortBy', 'salary');
            params.set('sortDesc', 'false');
        }
        if (newValue?.value === '2') {
            params.set('sortBy', 'salary');
            params.set('sortDesc', 'true');
        }
        if (newValue?.value === '3') {
            params.set('sortBy', 'created_at');
            params.set('sortDesc', 'true');
        }

        replace(`${pathname}?${params.toString()}`, `${pathname}?${params.toString()}`, {
            scroll: false,
        });
    };

    const onPageInit = () => {
        const params = new URLSearchParams(searchParams);
        params.delete('sortBy');
    };

    useEffect(() => {
        onPageInit();
        if (searchParams.get('sortBy') === null) {
            setValue(TYPES[0]);
        }
    }, [searchParams]);

    return (
        <Select
            data={TYPES}
            value={value?.value}
            onChange={(_, option) => onChange(option)}
            rightSection={<CaretDown />}
        />
    );
};
