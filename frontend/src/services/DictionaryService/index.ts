import { API_ROUTES, BaseApi, HTTP_METHOD } from '@/shared/api';

import {
    CitiesDictionaryRequest,
    CitiesDictionaryResponse,
    DepartmentsDto,
    DepartmentsResponse,
    ParamsQuery,
    TemplatesOfBenefitsDto,
    TemplatesOfBenefitsResponse,
    TemplatesOfTasksDto,
    TemplatesOfTasksResponse,
} from './dto';

const DictionaryService = BaseApi.enhanceEndpoints({
    addTagTypes: ['GET_STATISTIC_BY_ME'],
}).injectEndpoints({
    endpoints: (build) => ({
        getCitiesDictionary: build.query<CitiesDictionaryResponse, ParamsQuery | void>({
            query: (params) => ({
                params: params ?? {},
                url: API_ROUTES.cities,
            }),
        }),
        getSchedulesDictionary: build.query<Array<{ id: string; label: string }>, void | null>({
            query: () => ({
                method: HTTP_METHOD.GET,
                url: `/base/work-schedules`,
            }),
        }),
        getEmploymentTypesDictionary: build.query<Array<{ id: string; label: string }>, void | null>({
            query: () => ({
                method: HTTP_METHOD.GET,
                url: `/base/employment-types`,
            }),
        }),
        getCountryTypesDictionary: build.query<{ payload: Array<{ name: string; id: string }> }, void | ParamsQuery>({
            query: (params) => ({
                method: HTTP_METHOD.GET,
                url: `/base/countries`,
                params: params ?? {},
            }),
        }),
        getEducationalEstablishmentsDictionary: build.query<
            {
                payload: Array<{ name: string; id: string }>;
            },
            void | ParamsQuery
        >({
            query: (params) => ({
                method: HTTP_METHOD.GET,
                url: `/base/institutions`,
                params: params ?? {},
            }),
        }),
        getEducationalLevelsDictionary: build.query<Array<{ label: string; id: number }>, void | ParamsQuery>({
            query: (params) => ({
                method: HTTP_METHOD.GET,
                url: `/base/education-levels`,
                params: params ?? {},
            }),
        }),
        getCompaniesDictionary: build.query<
            {
                payload: Array<{ name: string; id: string }>;
            },
            void | ParamsQuery
        >({
            query: (params) => ({
                method: HTTP_METHOD.GET,
                url: `/base/companies`,
                params: params ?? {},
            }),
        }),
        getPositionDictionary: build.query<
            {
                payload: Array<{ name: string; id: string }>;
            },
            void | ParamsQuery
        >({
            query: (params) => ({
                method: HTTP_METHOD.GET,
                url: `/base/positions`,
                params: params ?? {},
            }),
        }),
        getContactsDictionary: build.query<Array<{ id: number; label: string }>, void | ParamsQuery>({
            query: (params) => ({
                method: HTTP_METHOD.GET,
                url: `/base/contact-types`,
                params: params ?? {},
            }),
        }),
        getCategoriesDictionary: build.query<{ id: number; label: string }[], void>({
            query: () => API_ROUTES.categories,
        }),
        getTemplatesOfBenefitsDictionary: build.query<TemplatesOfBenefitsResponse, TemplatesOfBenefitsDto>({
            query: () => API_ROUTES.templateOfBenefits,
        }),
        getTemplatesOfTasksDictionary: build.query<TemplatesOfTasksResponse, TemplatesOfTasksDto>({
            query: () => API_ROUTES.templateOfTasks,
        }),
        getDepartmentsDictionary: build.query<DepartmentsResponse, DepartmentsDto>({
            query: () => API_ROUTES.departments,
        }),
        getSkillsDictionary: build.query<DepartmentsResponse, void | ParamsQuery>({
            query: (params) => ({
                method: HTTP_METHOD.GET,
                url: API_ROUTES.skills,
                params: params ?? {},
            }),
        }),
    }),
});

export const {
    useGetCitiesDictionaryQuery,
    useGetSchedulesDictionaryQuery,
    useGetEmploymentTypesDictionaryQuery,
    useGetCountryTypesDictionaryQuery,
    useGetEducationalEstablishmentsDictionaryQuery,
    useGetEducationalLevelsDictionaryQuery,
    useGetCompaniesDictionaryQuery,
    useGetPositionDictionaryQuery,
    useGetContactsDictionaryQuery,
    useGetCategoriesDictionaryQuery,
    useGetTemplatesOfBenefitsDictionaryQuery,
    useGetTemplatesOfTasksDictionaryQuery,
    useGetDepartmentsDictionaryQuery,
    useGetSkillsDictionaryQuery,
} = DictionaryService;
