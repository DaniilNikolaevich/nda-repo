import { isEmpty, omitBy } from 'lodash-es';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';

import { useGetAllVacanciesQuery, useGetSuitableVacanciesQuery } from './index';

export const useGetVacanciesList = () => {
    const { pathname } = useRouter();
    const searchParams = useSearchParams();
    const tab = searchParams.get('activeTab');
    const page = searchParams.get('page') ?? 1;
    const search = searchParams.get('search') ?? '';
    const salary__gte = searchParams.get('salary__gte') ?? '';
    const city__in = searchParams.get('city__in') ?? '';
    const date_range = searchParams.get('date_range') ?? '';
    const category__in = searchParams.get('category__in') ?? '';
    const employment_type_in = searchParams.get('employment_type_in') ?? '';
    const work_schedule_in = searchParams.get('work_schedule_in') ?? '';
    const sortBy = searchParams.get('sortBy') ?? '';
    const sortDesc = searchParams.get('sortDesc') ?? '';
    const created_at = searchParams.get('created_at') ?? '';

    const params = omitBy(
        {
            page,
            itemsPerPage: 10,
            search,
            salary__gte,
            city__in,
            date_range,
            category__in,
            employment_type_in,
            work_schedule_in,
            sortBy,
            sortDesc,
            created_at,
        },
        isEmpty
    );

    const { data, isLoading, isFetching } = useGetAllVacanciesQuery(params, {
        skip: pathname !== '/vacancies' || tab === 'my',
        refetchOnMountOrArgChange: true,
    });

    const { data: suitableVacancies } = useGetSuitableVacanciesQuery(params, {
        skip: pathname !== '/vacancies' || tab !== 'my',
        refetchOnMountOrArgChange: true,
    });

    return {
        data: tab === 'my' ? suitableVacancies : data?.payload,
        totalPages: tab === 'my' ? 1 : data?.total_pages,
        totalCount: tab === 'my' ? suitableVacancies?.length : data?.total_count,
        isLoading: isLoading || isFetching,
        tab,
    };
};
