import { BaseApi, HTTP_METHOD } from '@/shared/api';

const ProfileStatisticService = BaseApi.enhanceEndpoints({
    addTagTypes: ['GET_STATISTIC_BY_ME', 'GET_STATISTIC_BY_USER'],
}).injectEndpoints({
    endpoints: (build) => ({
        getProfileStatisticByMe: build.query<{ total_fields: number; filled_fields: number }, void | null>({
            query: () => ({
                method: HTTP_METHOD.GET,
                url: `/users/me/profile-occupancy`,
            }),
            providesTags: ['GET_STATISTIC_BY_ME'],
        }),
        getProfileStatisticByUser: build.query<{ total_fields: number; filled_fields: number }, { userId: string }>({
            query: ({ userId }) => ({
                method: HTTP_METHOD.GET,
                url: `/users/${userId}/profile-occupancy`,
            }),
            providesTags: ['GET_STATISTIC_BY_USER'],
        }),
    }),
});

export const { useGetProfileStatisticByUserQuery, useGetProfileStatisticByMeQuery } = ProfileStatisticService;
