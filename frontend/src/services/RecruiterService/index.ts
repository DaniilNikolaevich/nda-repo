import { API_ROUTES, BaseApi, HTTP_METHOD } from '@/shared/api';
import { CommentAboutUserModel, RecruitmentProcessModel } from '@/shared/types/common-models';
import { AdminBookingByIdResponse, AdminBookingType } from '@/shared/types/common-models/Calendar';

import {
    ChangeAdditionalRecruiterInfoByMeDto,
    ChangeMainRecruiterInfoByMeDto,
    CreateWeeklySheduleDto,
    GenerateSheduleDto,
    GetRecruiterInfoByMeDto,
    GetShedulesMeResponse,
    GetUsersListDto,
    InviteToRecruiterDto,
} from './dto';

const RecruiterService = BaseApi.enhanceEndpoints({
    addTagTypes: [
        'GET_ALL_SHEDULE',
        'RECRUITER_FLOWS',
        'RECRUITER_COMMENTS',
        'RECRUITER_HISTORY',
        'RECRUITER_ALLOWED_STEPS',
        'TEMPLATE_MESSAGE',
    ],
}).injectEndpoints({
    endpoints: (build) => ({
        getUsersList: build.query<GetUsersListDto, void | null>({
            query: () => ({
                method: HTTP_METHOD.GET,
                url: `/users/admin/users?role=3&is_active=true&is_registered=true`,
            }),
        }),
        getInfoRecruiterByMe: build.query<GetRecruiterInfoByMeDto, void | null>({
            query: () => ({
                method: HTTP_METHOD.GET,
                url: `/users/admin/me/info`,
            }),
        }),
        changeAdditionalInfoRecruiterByMe: build.mutation<void | null, ChangeAdditionalRecruiterInfoByMeDto>({
            query: (body) => ({
                method: HTTP_METHOD.PUT,
                url: `/users/admin/me/info`,
                body,
            }),
        }),
        changeMainInfoRecruiterByMe: build.mutation<void | null, ChangeMainRecruiterInfoByMeDto>({
            query: (body) => ({
                method: HTTP_METHOD.PUT,
                url: `/users/admin/me`,
                body,
            }),
        }),
        uploadRecruiterAvatar: build.mutation<void | null, FormData>({
            query: (body) => ({
                method: HTTP_METHOD.POST,
                url: `/users/admin/me/avatar`,
                body,
                formData: true,
            }),
        }),
        inviteToRecruiter: build.mutation<void | null, InviteToRecruiterDto>({
            query: (body) => ({
                method: HTTP_METHOD.POST,
                url: `/users/admin/users`,
                body,
            }),
        }),
        getRecruiterFlowSteps: build.query<{ id: number; label: string }, void>({
            query: () => ({
                method: HTTP_METHOD.GET,
                url: API_ROUTES.recruiterFlowSteps,
            }),
        }),
        recruiterFlows: build.query<RecruitmentProcessModel[], string>({
            query: (vacancy_id) => ({
                method: HTTP_METHOD.GET,
                url: API_ROUTES.recruiterFlows(vacancy_id),
            }),
            providesTags: ['RECRUITER_FLOWS'],
        }),
        getViewAdminBooking: build.query<AdminBookingType, void | null>({
            query: () => ({
                method: HTTP_METHOD.GET,
                url: `/calendars/admin/booking`,
            }),
        }),
        getViewAdminBookingById: build.query<AdminBookingByIdResponse, { event_id: string }>({
            query: ({ event_id }) => ({
                method: HTTP_METHOD.GET,
                url: `/calendars/admin/booking/${event_id}`,
            }),
        }),
        getViewShedule: build.query<GetShedulesMeResponse, { recruiter_id: string }>({
            query: ({ recruiter_id }) => ({
                method: HTTP_METHOD.GET,
                url: `/calendars/recruiter/${recruiter_id}/schedule`,
            }),
            providesTags: ['GET_ALL_SHEDULE'],
        }),
        createWeeklyShedule: build.mutation<void | null, CreateWeeklySheduleDto>({
            query: ({ recruiter_id, shedules }) => ({
                method: HTTP_METHOD.POST,
                url: `/calendars/recruiter/${recruiter_id}/schedule`,
                body: shedules,
            }),
            invalidatesTags: ['GET_ALL_SHEDULE'],
        }),
        changeWeeklyShedule: build.mutation<void | null, CreateWeeklySheduleDto>({
            query: ({ recruiter_id, shedules }) => ({
                method: HTTP_METHOD.PUT,
                url: `/calendars/recruiter/${recruiter_id}/schedule`,
                body: shedules,
            }),
            invalidatesTags: ['GET_ALL_SHEDULE'],
        }),
        generateShedule: build.mutation<Array<{ start_time: string; end_time: string }>, GenerateSheduleDto>({
            query: (body) => ({
                method: HTTP_METHOD.POST,
                url: `/calendars/generate-time-slots`,
                body,
            }),
            invalidatesTags: ['GET_ALL_SHEDULE'],
        }),
        getAllowedSteps: build.query<[0, 1, 2, 3, 4, 5, 6, 7, 8], string>({
            query: (recruiter_flow_id) => ({
                method: HTTP_METHOD.GET,
                url: `/vacancies/recruiter-flows/${recruiter_flow_id}/allowed-steps`,
            }),
            providesTags: ['RECRUITER_ALLOWED_STEPS'],
        }),
        changeAllowedStep: build.mutation<void, { step: number; recruiter_flow_id: string }>({
            query: ({ recruiter_flow_id, ...body }) => ({
                method: HTTP_METHOD.PUT,
                url: `/vacancies/recruiter-flows/${recruiter_flow_id}/change-step`,
                body,
            }),
            invalidatesTags: ['RECRUITER_FLOWS', 'RECRUITER_HISTORY'],
        }),
        getCommentsAboutUser: build.query<{ payload: CommentAboutUserModel[] }, string>({
            query: (user_id) => ({
                method: HTTP_METHOD.GET,
                url: API_ROUTES.getCommentsAboutUser(user_id),
            }),
            providesTags: ['RECRUITER_COMMENTS'],
        }),
        inviteCandidateOnInterview: build.mutation<{ message: string }, string>({
            query: (recruiter_flow_id) => ({
                method: HTTP_METHOD.POST,
                url: `/vacancies/recruiter-flows/${recruiter_flow_id}/invite-candidate`,
            }),
            invalidatesTags: ['RECRUITER_FLOWS', 'RECRUITER_HISTORY'],
        }),
        selectCandidate: build.mutation<
            void | null,
            {
                vacancy: string;
                candidate: string;
            }
        >({
            query: (body) => ({
                method: HTTP_METHOD.POST,
                url: `/vacancies/select-candidate`,
                body,
            }),
        }),
        declineInterviewByRecruiter: build.mutation<{ message: string }, { interview: string }>({
            query: (body) => ({
                method: HTTP_METHOD.POST,
                url: `/vacancies/decline-by-recruiter`,
                body,
            }),
            invalidatesTags: ['RECRUITER_FLOWS', 'RECRUITER_HISTORY'],
        }),
        sendCommentAboutCandidate: build.mutation<
            void,
            {
                body: FormData;
                user_id: string;
            }
        >({
            query: ({ user_id, body }) => ({
                method: HTTP_METHOD.POST,
                url: `/users/${user_id}/comments`,
                body,
                formData: true,
            }),
            invalidatesTags: ['RECRUITER_HISTORY', 'RECRUITER_COMMENTS'],
        }),
        getCandidateHistoryFlow: build.query<{ id: string; message: string; created_at: string }[], string>({
            query: (recruiter_flow_id) => ({
                method: HTTP_METHOD.GET,
                url: `/vacancies/recruiter-flows/${recruiter_flow_id}/history`,
            }),
            providesTags: ['RECRUITER_HISTORY'],
        }),
        getTemplateMessages: build.query<{ id: string; message: string }[], void>({
            query: () => `/chat/admin/default-messages`,
            providesTags: ['TEMPLATE_MESSAGE'],
        }),
        createTemplateMessage: build.mutation<void, { message: string }>({
            query: (body) => ({
                url: '/chat/admin/default-messages',
                method: HTTP_METHOD.POST,
                body,
            }),
            invalidatesTags: ['TEMPLATE_MESSAGE'],
        }),
        downloadResume: build.query<File, string>({
            query: (params) => ({
                method: HTTP_METHOD.GET,
                url: `/users/${params}/download-cv`,
                responseHandler: async (response) => window.open(window.URL.createObjectURL(await response.blob())),
                cache: 'no-cache',
            }),
        }),
        selectDateSlotFlow: build.mutation<
            void | null,
            {
                interview: string;
                time_slot: string;
                interview_date: string;
            }
        >({
            query: (body) => ({
                method: HTTP_METHOD.POST,
                url: `/vacancies/choose-time`,
                body,
            }),
        }),
        availableSlotBySelectedDate: build.query<
            Array<{ id: string; start_time: string; end_time: string }>,
            {
                interview_id: string;
                date: string;
            }
        >({
            query: ({ interview_id, ...params }) => ({
                method: HTTP_METHOD.GET,
                url: `/calendars/interview/${interview_id}/available-time-slots`,
                params,
            }),
        }),
        availableDatesForInterview: build.query<
            Array<string>,
            {
                interview_id: string;
                date?: string | Array<string>;
            }
        >({
            query: ({ interview_id, date, ...params }) => ({
                method: HTTP_METHOD.GET,
                url: `/calendars/interview/${interview_id}/available-dates?${date}`,
            }),
        }),
        declinedDatesForInterview: build.mutation<
            void | null,
            {
                interview: string;
            }
        >({
            query: (body) => ({
                method: HTTP_METHOD.POST,
                url: `/vacancies/decline-by-candidate`,
                body,
            }),
        }),
    }),
});

export const {
    useGetInfoRecruiterByMeQuery,
    useGetUsersListQuery,
    useChangeAdditionalInfoRecruiterByMeMutation,
    useChangeMainInfoRecruiterByMeMutation,
    useUploadRecruiterAvatarMutation,
    useInviteToRecruiterMutation,
    useGetRecruiterFlowStepsQuery,
    useRecruiterFlowsQuery,
    useGetViewSheduleQuery,
    useGetViewAdminBookingQuery,
    useGetViewAdminBookingByIdQuery,
    useCreateWeeklySheduleMutation,
    useGenerateSheduleMutation,
    useChangeWeeklySheduleMutation,
    useGetAllowedStepsQuery,
    useChangeAllowedStepMutation,
    useGetCommentsAboutUserQuery,
    useInviteCandidateOnInterviewMutation,
    useSelectCandidateMutation,
    useDeclineInterviewByRecruiterMutation,
    useSendCommentAboutCandidateMutation,
    useGetCandidateHistoryFlowQuery,
    useGetTemplateMessagesQuery,
    useCreateTemplateMessageMutation,
    useSelectDateSlotFlowMutation,
    useAvailableSlotBySelectedDateQuery,
    useAvailableDatesForInterviewQuery,
    useDeclinedDatesForInterviewMutation,
    useLazyDownloadResumeQuery,
    useDownloadResumeQuery,
} = RecruiterService;
