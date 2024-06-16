import { useEffect, useState } from 'react';
import { Checkbox, Loader, Stack } from '@mantine/core';
import { uniq } from 'lodash-es';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';

import { useGetSchedulesDictionaryQuery } from '@/services';

export const VacanciesSchedule = () => {
    const { data: schedules, isLoading } = useGetSchedulesDictionaryQuery();
    const searchParams = useSearchParams();
    const { replace, pathname } = useRouter();
    const [value, setValue] = useState<string[]>([]);

    const onChange = (value: string[]) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            setValue(value);
            params.set('work_schedule_in', `${value}`);
        } else {
            setValue([]);
            params.delete('work_schedule_in');
        }

        replace(`${pathname}?${params.toString()}`, `${pathname}?${params.toString()}`, {
            scroll: false,
        });
    };

    const onPageInit = () => {
        const params = new URLSearchParams(searchParams);
        const search = searchParams.get('work_schedule_in') ?? '';

        setValue(uniq(search.split(',').filter((el) => el !== '')));
        params.set('work_schedule_in', search);
    };

    useEffect(() => {
        if (isLoading) return;
        onPageInit();
    }, [isLoading, searchParams]);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <Checkbox.Group label='График работы' value={value} onChange={onChange}>
            <Stack gap='var(--size-sm)'>
                {schedules?.map((schedule) => (
                    <Checkbox checked key={schedule.id} value={schedule.id.toString()} label={schedule.label} />
                ))}
            </Stack>
        </Checkbox.Group>
    );
};
