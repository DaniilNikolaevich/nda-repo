import { useEffect, useState } from 'react';
import { Checkbox, Loader, Stack } from '@mantine/core';
import { uniq } from 'lodash-es';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';

import { useGetEmploymentTypesDictionaryQuery } from '@/services';

export const VacanciesTypeFilter = () => {
    const { data: types, isLoading } = useGetEmploymentTypesDictionaryQuery();
    const searchParams = useSearchParams();
    const { replace, pathname } = useRouter();
    const [value, setValue] = useState<string[]>([]);

    const onChange = (value: string[]) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            setValue(value);
            params.set('employment_type__in', `${value}`);
        } else {
            setValue([]);
            params.delete('employment_type__in');
        }

        replace(`${pathname}?${params.toString()}`, `${pathname}?${params.toString()}`, {
            scroll: false,
        });
    };

    const onPageInit = () => {
        const params = new URLSearchParams(searchParams);
        const search = searchParams.get('employment_type__in') ?? '';

        setValue(uniq(search.split(',')));
        params.set('employment_type__in', search);
    };

    useEffect(() => {
        if (isLoading) return;
        onPageInit();
    }, [isLoading, searchParams]);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <Checkbox.Group label='Тип занятости' value={value} onChange={onChange}>
            <Stack gap='var(--size-sm)'>
                {types?.map((category) => (
                    <Checkbox checked key={category.id} value={category.id.toString()} label={category.label} />
                ))}
            </Stack>
        </Checkbox.Group>
    );
};
