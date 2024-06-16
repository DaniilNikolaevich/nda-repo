import { useSearchParams } from 'next/navigation';

import { useGetCitiesDictionaryQuery } from '@/services';

export const useGetCities = () => {
    const searchParams = useSearchParams();
    const page = 1;
    const search = '';

    const params = {
        page,
        itemsPerPage: 10,
        sortDesc: false,
        search,
    };
    const { moscow, isLoadingMoscow } = useGetCitiesDictionaryQuery(
        { ...params, search: 'Москва' },
        {
            selectFromResult: ({ data, isLoading }) => ({
                moscow: data?.payload[0],
                isLoadingMoscow: isLoading,
            }),
        }
    );
    const { spb, isLoadingSpb } = useGetCitiesDictionaryQuery(
        { ...params, search: 'Санкт-Петербург' },
        {
            selectFromResult: ({ data, isLoading }) => ({
                spb: data?.payload[0],
                isLoadingSpb: isLoading,
            }),
        }
    );

    return {
        moscow,
        spb,
        isLoading: isLoadingMoscow || isLoadingSpb,
    };
};
