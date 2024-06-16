import { useEffect, useState } from 'react';
import { Box, Checkbox, Stack } from '@mantine/core';
import { uniq } from 'lodash-es';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';

import { useGetCities } from '@/shared/hooks';

import { useCitiesList } from './model';
import { AdditionalRegions } from './ui';

export const VacanciesRegionFilter = () => {
    const [additionalCities, { set: setAdditionalCities }] = useCitiesList();
    const searchParams = useSearchParams();
    const { replace, pathname } = useRouter();

    const [values, setValues] = useState<string[]>([]);
    const onChange = (value: string[]) => {
        setValues(value);
    };

    const { moscow, spb } = useGetCities();

    const onPageInit = () => {
        const params = new URLSearchParams(searchParams);

        if (moscow && spb) {
            setValues([moscow.id, spb.id]);
            params.set('city__in', `${moscow.id},${spb.id}`);
        } else {
            setValues(['']);
            params.delete('city__in');
        }
        replace(`${pathname}?${params.toString()}`, `${pathname}?${params.toString()}`, {
            scroll: false,
        });
    };

    useEffect(() => {
        onPageInit();
    }, []);

    useEffect(() => {
        setValues((prev) => uniq([...prev, ...(additionalCities ?? []).map((c) => c.id)]));
    }, [additionalCities]);

    useEffect(() => {
        const params = new URLSearchParams(searchParams);

        params.set('city__in', `${uniq([...values, ...(additionalCities ?? []).map((el) => el.id)]).join(',')}`);

        replace(`${pathname}?${params.toString()}`);
    }, [values, additionalCities]);

    return (
        <Box>
            <Checkbox.Group mb='var(--size-md)' label='Регион' value={values} onChange={onChange}>
                <Stack gap='var(--size-sm)'>
                    <Checkbox value={moscow?.id} label={moscow?.name} />
                    <Checkbox value={spb?.id} label={spb?.name} />
                    {additionalCities?.map((city) => (
                        <Checkbox
                            onClick={() => setAdditionalCities((prev) => prev.filter((el) => el.id !== city.id))}
                            checked
                            key={city.id}
                            value={city.id}
                            label={city.name}
                        />
                    ))}
                </Stack>
            </Checkbox.Group>
            <AdditionalRegions />
        </Box>
    );
};
