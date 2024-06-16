import { ActionIcon, Affix, Drawer, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Sliders } from '@phosphor-icons/react/dist/ssr/Sliders';

import { useGetCities } from '@/shared/hooks';
import { useIsSmallTablet, useIsTablet } from '@/shared/hooks/media';

import { ResetAllFilters } from './ResetAllFilters';
import { VacanciesCategoryFilter } from './VacanciesCategoryFilter';
import { VacanciesPeriodFilter } from './VacanciesPeriodFilter';
import { VacanciesRegionFilter } from './VacanciesRegionFilter';
import { VacanciesSalaryFilter } from './VacanciesSalaryFilter';
import { VacanciesSchedule } from './VacanciesSchedule';
import { VacanciesTypeFilter } from './VacanciesTypeFilter';

import s from './VacansiesAsideFilters.module.scss';
export const VacanciesAsideFilters = () => {
    const [opened, { open, close }] = useDisclosure(false);
    const isTablet = useIsTablet();
    const isSmallTabletMedia = useIsSmallTablet();
    const { isLoading } = useGetCities();

    const wrapperProps = {
        opened,
        onClose: close,
        size: isSmallTabletMedia ? 'xs' : '100%',
    };

    const render = () => (
        <Stack className={s.root} miw={180} gap='var(--size-5xl)' component='aside'>
            <VacanciesSalaryFilter />
            {!isLoading && <VacanciesRegionFilter />}
            <VacanciesPeriodFilter />
            <VacanciesCategoryFilter />
            <VacanciesTypeFilter />
            <VacanciesSchedule />
            <ResetAllFilters />
        </Stack>
    );

    return (
        <>
            {!isTablet && <Drawer {...wrapperProps}>{render()}</Drawer>}
            {isTablet && <>{render()}</>}
            {!isTablet && (
                <Affix position={{ bottom: 20, right: 20 }}>
                    <ActionIcon size='xl' onClick={open}>
                        <Sliders />
                    </ActionIcon>
                </Affix>
            )}
        </>
    );
};
