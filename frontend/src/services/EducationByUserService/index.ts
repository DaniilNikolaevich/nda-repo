import { BaseApi, HTTP_METHOD } from '@/shared/api';

import { ChangeEducationByMeDto, GetEducationByMeDto } from './dto';

const EducationByUserService = BaseApi.enhanceEndpoints({
    addTagTypes: [],
}).injectEndpoints({
    endpoints: (build) => ({
        getEducationByUser: build.query<Array<GetEducationByMeDto>, { userId: string }>({
            query: ({ userId }) => ({
                method: HTTP_METHOD.GET,
                url: `/users/${userId}/education`,
            }),
        }),
        getEducationByMe: build.query<Array<GetEducationByMeDto>, void | null>({
            query: () => ({
                method: HTTP_METHOD.GET,
                url: `/users/me/education`,
            }),
        }),
        changeEducationInfo: build.mutation<ChangeEducationByMeDto, object>({
            query: (body) => ({
                method: HTTP_METHOD.POST,
                url: `/users/me/education`,
                body,
            }),
        }),
    }),
});

export const { useGetEducationByUserQuery, useGetEducationByMeQuery, useChangeEducationInfoMutation } =
    EducationByUserService;
