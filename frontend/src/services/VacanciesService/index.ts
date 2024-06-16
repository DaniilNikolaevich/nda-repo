import { API_ROUTES, BaseApi, HTTP_METHOD } from '@/shared/api';
import { CandidateModel } from '@/shared/types/common-models/Candidates';

import {
    CandidateParams,
    ChangeVacancyDto,
    CreateVacancyDto,
    VacanciesForRecruiterParamsDTO,
    VacanciesParamsDTO,
    VacanciesResponse,
    VacancyByIdDTO,
    VacancyByIdResponse,
    VacancyStatusDto,
} from './dto';

const VacanciesService = BaseApi.enhanceEndpoints({
    addTagTypes: ['GET_ALL_VACANCIES', 'MY_CHATS'],
}).injectEndpoints({
    endpoints: (build) => ({
        getAllVacancies: build.query<VacanciesResponse, VacanciesParamsDTO>({
            query: (params) => ({
                url: API_ROUTES.vacancies,
                params,
            }),
        }),
        getAllVacanciesForRecruiter: build.query<VacanciesResponse, VacanciesForRecruiterParamsDTO>({
            query: (params) => ({
                url: API_ROUTES.vacanciesForRecruiter,
                params,
            }),
            providesTags: ['GET_ALL_VACANCIES'],
        }),
        getVacancyById: build.query<VacancyByIdResponse, VacancyByIdDTO>({
            query: ({ vacancy_id }) => ({
                url: `/vacancies/recruiter-vacancies/${vacancy_id}`,
            }),
        }),
        changeVacancyStatus: build.mutation<void | null, VacancyStatusDto>({
            query: ({ vacancy_id, status }) => ({
                url: `/vacancies/recruiter-vacancies/${vacancy_id}/status`,
                method: HTTP_METHOD.PUT,
                body: {
                    status,
                },
            }),
            invalidatesTags: ['GET_ALL_VACANCIES'],
        }),
        createVacancy: build.mutation<void | null, CreateVacancyDto>({
            query: (body) => ({
                url: `/vacancies/recruiter-vacancies`,
                method: HTTP_METHOD.POST,
                body,
            }),
            invalidatesTags: ['GET_ALL_VACANCIES'],
        }),
        changeVacancy: build.mutation<void | null, ChangeVacancyDto>({
            query: ({ vacancy_id, ...body }) => ({
                url: `/vacancies/recruiter-vacancies/${vacancy_id}`,
                method: HTTP_METHOD.PUT,
                body,
            }),
            invalidatesTags: ['GET_ALL_VACANCIES'],
        }),
        dublicateVacancy: build.mutation<void | null, ChangeVacancyDto>({
            query: ({ vacancy_id, ...body }) => ({
                url: `/vacancies/${vacancy_id}/duplicate`,
                method: HTTP_METHOD.POST,
            }),
            invalidatesTags: ['GET_ALL_VACANCIES'],
        }),
        getAllCandidates: build.query<{ total_pages: number; payload: CandidateModel[] }, CandidateParams>({
            query: (params) => ({
                url: `/vacancies/candidates`,
                params,
            }),
        }),
        applyForJob: build.mutation<{ message: string }, { vacancy: string }>({
            query: (body) => ({
                url: `/vacancies/respond-vacancy`,
                method: HTTP_METHOD.POST,
                body,
            }),
            invalidatesTags: ['GET_ALL_VACANCIES', 'MY_CHATS'],
        }),
    }),
});

export const {
    useGetAllVacanciesQuery,
    useGetAllVacanciesForRecruiterQuery,
    useGetVacancyByIdQuery,
    useChangeVacancyStatusMutation,
    useCreateVacancyMutation,
    useChangeVacancyMutation,
    useDublicateVacancyMutation,
    useGetAllCandidatesQuery,
    useApplyForJobMutation,
} = VacanciesService;
