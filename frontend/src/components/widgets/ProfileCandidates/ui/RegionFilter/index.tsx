import { SetStateAction } from 'react';
import { Box, Checkbox, type CheckboxGroupProps, Stack } from '@mantine/core';

import { useCitiesList } from '@/components/features/VacanciesAsideFilters/VacanciesRegionFilter/model';
import { AdditionalRegions } from '@/components/features/VacanciesAsideFilters/VacanciesRegionFilter/ui';
import { useGetCities } from '@/shared/hooks';
import type { CityModel } from '@/shared/types/common-models';

export const RegionFilter = ({
    value,
    onChange,
}: {
    value: CheckboxGroupProps['value'];
    onChange: CheckboxGroupProps['onChange'];
    extraCities?: CityModel[];
    setExtraCities?: (v: SetStateAction<CityModel[]>) => void;
}) => {
    const { moscow, spb } = useGetCities();
    const [additionalCities, { set: setAdditionalCities }] = useCitiesList();

    return (
        <Box>
            <Checkbox.Group mb='var(--size-md)' label='Регион' value={value} onChange={onChange}>
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
