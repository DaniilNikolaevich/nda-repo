import { Button } from '@mantine/core';
import { useRouter } from 'next/router';

import { setCitiesList } from '@/components/features/VacanciesAsideFilters/VacanciesRegionFilter/model';

export const ResetAllFilters = () => {
    const { replace, pathname } = useRouter();

    const onRemoveSearchParamsHandler = () => {
        replace(`${pathname}?`).then(() => {
            setCitiesList([]);
        });
    };

    return (
        <Button w='fit-content' onClick={onRemoveSearchParamsHandler} variant='subtle'>
            Сбросить все
        </Button>
    );
};
