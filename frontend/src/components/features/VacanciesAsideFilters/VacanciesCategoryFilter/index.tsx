import { useEffect, useState } from 'react';
import { Checkbox, Loader, Stack } from '@mantine/core';
import { uniq } from 'lodash-es';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';

import { useGetCategoriesDictionaryQuery } from '@/services';

export const VacanciesCategoryFilter = () => {
    const { data: categories, isLoading } = useGetCategoriesDictionaryQuery();
    const searchParams = useSearchParams();
    const { replace, pathname } = useRouter();
    const [value, setValue] = useState<string[]>([]);

    const onChange = (value: string[]) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            setValue(value);
            params.set('category__in', `${value}`);
        } else {
            setValue([]);
            params.delete('category__in');
        }
        replace(`${pathname}?${params.toString()}`, `${pathname}?${params.toString()}`, {
            scroll: false,
        });
    };

    const onPageInit = () => {
        const params = new URLSearchParams(searchParams);
        const search = searchParams.get('category__in') ?? '';

        setValue(uniq(search.split(',')));
        params.set('category__in', search);
    };

    useEffect(() => {
        if (isLoading) return;
        onPageInit();
    }, [isLoading, searchParams]);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <Checkbox.Group label='Категория' value={value} onChange={onChange}>
            <Stack gap='var(--size-sm)'>
                {categories?.map((category) => (
                    <Checkbox checked key={category.id} value={category.id.toString()} label={category.label} />
                ))}
            </Stack>
        </Checkbox.Group>
    );
};
