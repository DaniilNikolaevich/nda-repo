import { ChangeWorkExperienceDto, GetWorkExperienceDto } from '@/services/ExperienceByUserService/dto';
import { BaseApi, HTTP_METHOD } from '@/shared/api';

const ExperienceByUserService = BaseApi.enhanceEndpoints({
    addTagTypes: [],
}).injectEndpoints({
    endpoints: (build) => ({
        getAllWorkExperienceByUser: build.query<Array<GetWorkExperienceDto>, { userId: string }>({
            query: ({ userId }) => ({
                method: HTTP_METHOD.GET,
                url: `/users/${userId}/work-experience`,
            }),
        }),
        getAllWorkExperienceByMe: build.query<Array<GetWorkExperienceDto>, void | null>({
            query: () => ({
                method: HTTP_METHOD.GET,
                url: `/users/me/work-experience`,
            }),
        }),
        setWorkExperienceByMe: build.mutation<void | null, Array<ChangeWorkExperienceDto>>({
            query: (body) => ({
                method: HTTP_METHOD.POST,
                url: `/users/me/work-experience`,
                body,
            }),
        }),
    }),
});

export const {
    useGetAllWorkExperienceByUserQuery,
    useGetAllWorkExperienceByMeQuery,
    useSetWorkExperienceByMeMutation,
} = ExperienceByUserService;
