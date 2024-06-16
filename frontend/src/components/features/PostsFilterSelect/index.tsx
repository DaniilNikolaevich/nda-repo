import { useState } from 'react';
import { type ComboboxItem, Select } from '@mantine/core';
import { isNull } from 'lodash-es';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';

const data: ComboboxItem[] = [
    {
        label: 'Сначала новые',
        value: '',
    },
    {
        label: 'Сначала старые',
        value: 'created_at',
    },
];

export const PostsFilterSelect = () => {
    const [value, setValue] = useState<ComboboxItem | null>(data[0]);
    const searchParams = useSearchParams();
    const { replace, pathname } = useRouter();

    const onChange = async (_: string | null, option: ComboboxItem) => {
        const params = new URLSearchParams(searchParams);
        if (isNull(option)) return;
        if (option.value === 'created_at') {
            params.set('sortBy', 'created_at');
            params.set('sortDesc', 'false');
            setValue(option);
        } else {
            params.delete('sortBy');
            params.delete('sortDesc');
            setValue(data[0]);
        }
        params.set('page', '1');
        await replace(`${pathname}?${params.toString()}`);
    };

    return <Select data={data} value={value?.value} onChange={onChange} />;
};
