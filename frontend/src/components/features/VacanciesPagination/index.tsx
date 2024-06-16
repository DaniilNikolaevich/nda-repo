import { Pagination } from '@mantine/core';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';

import { useGetVacanciesList } from '@/services/VacanciesService/hooks';

export const VacanciesPagination = () => {
    const searchParams = useSearchParams();
    const { replace, pathname } = useRouter();
    const { totalPages } = useGetVacanciesList();

    const onPageChange = (value: number) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set('page', `${value}`);
        } else {
            params.delete('page');
        }

        replace(`${pathname}?${params.toString()}`);
    };

    return <Pagination mt='auto' pt={20} total={totalPages ?? 0} onChange={onPageChange} />;
};
