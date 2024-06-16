import { BaseApi, HTTP_METHOD } from '@/shared/api';

import { ChangeMeInfoDto, GetMeInfoDto, PatchUserContactsDto, UploadUserAvatarDto, UserInfoDto } from './dto';

const UserCabinetService = BaseApi.enhanceEndpoints({
    addTagTypes: ['GET_STATISTIC_BY_ME'],
}).injectEndpoints({
    endpoints: (build) => ({
        getMainInfoByUser: build.query<GetMeInfoDto, { userId: string }>({
            query: ({ userId }) => ({
                method: HTTP_METHOD.GET,
                url: `/users/${userId}/info`,
            }),
        }),
        changeUserInfo: build.mutation<void | null, UserInfoDto>({
            query: ({ userId, ...body }) => ({
                method: HTTP_METHOD.PUT,
                url: `/users/${userId}/info`,
                body,
            }),
        }),
        changeMeInfo: build.mutation<void | null, ChangeMeInfoDto>({
            query: (body) => ({
                method: HTTP_METHOD.PUT,
                url: `/users/me/info`,
                body,
            }),
        }),
        getMainInfoByMe: build.query<GetMeInfoDto, void | null>({
            query: () => ({
                method: HTTP_METHOD.GET,
                url: `/users/me/info`,
            }),
        }),
        subscribeOnVacancies: build.mutation<void | null, FormData>({
            query: (body) => ({
                method: HTTP_METHOD.POST,
                url: `/vacancies/subscribe`,
                body,
                formData: true,
            }),
        }),
        uploadUserAvatar: build.mutation<void | null, FormData>({
            query: (body) => ({
                method: HTTP_METHOD.POST,
                url: `/users/me/avatar`,
                body,
                formData: true,
            }),
        }),
        deleteUserAvatar: build.mutation<void | null, void | null>({
            query: () => ({
                method: HTTP_METHOD.DELETE,
                url: `/users/me/avatar`,
            }),
        }),
        patchUserContacts: build.mutation<void | null, PatchUserContactsDto>({
            query: ({ contacts }) => ({
                method: HTTP_METHOD.PATCH,
                url: `/users/me/info`,
                body: {
                    contacts,
                },
            }),
        }),
    }),
});

export const {
    useGetMainInfoByUserQuery,
    useChangeMeInfoMutation,
    useUploadUserAvatarMutation,
    useDeleteUserAvatarMutation,
    useChangeUserInfoMutation,
    useGetMainInfoByMeQuery,
    usePatchUserContactsMutation,
    useSubscribeOnVacanciesMutation,
} = UserCabinetService;
