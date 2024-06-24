import { BaseApi, HTTP_METHOD } from '@/shared/api';
import { ChatMessageModel, ChatModel } from '@/shared/types/common-models/Chat';

import { GetChatsByCandidateResponse } from './dto';

const ChatsService = BaseApi.enhanceEndpoints({
    addTagTypes: ['GET_STATISTIC_BY_ME', 'MY_CHATS', 'CHAT_HISTORY'],
}).injectEndpoints({
    overrideExisting: true,
    endpoints: (build) => ({
        getChatByCandidate: build.query<GetChatsByCandidateResponse, { candidate_id: string }>({
            query: ({ candidate_id }) => ({
                method: HTTP_METHOD.GET,
                url: `chat/users/${candidate_id}`,
            }),
        }),
        createChatByCandidate: build.mutation<{ chat_id: string }, { candidate_id: string }>({
            query: (body) => ({
                method: HTTP_METHOD.POST,
                url: `/chat/`,
                body,
            }),
            invalidatesTags: ['MY_CHATS'],
        }),
        getAllMyChats: build.query<{ token: string; chats: ChatModel[] }, void>({
            query: () => ({
                method: HTTP_METHOD.GET,
                url: `/chat/my`,
            }),
            providesTags: ['MY_CHATS'],
        }),
        getChatHistory: build.query<ChatMessageModel[], string>({
            query: (chat_id) => ({
                method: HTTP_METHOD.GET,
                url: `/chat/${chat_id}`,
            }),
            providesTags: ['CHAT_HISTORY'],
        }),
        sendChatMessage: build.mutation<void, { chat_id: string; message: string }>({
            query: ({ chat_id, ...body }) => ({
                url: `/chat/${chat_id}`,
                method: HTTP_METHOD.POST,
                body,
            }),
            invalidatesTags: ['CHAT_HISTORY'],
        }),
        getNotifications: build.query<{ total: number; [K: string]: number }, void>({
            query: () => ({
                method: HTTP_METHOD.GET,
                url: `/chat/notification-stats`,
            }),
        }),
    }),
});

export const {
    useGetChatByCandidateQuery,
    useCreateChatByCandidateMutation,
    useGetAllMyChatsQuery,
    useGetChatHistoryQuery,
    useLazyGetChatHistoryQuery,
    useSendChatMessageMutation,
    useGetNotificationsQuery,
    useLazyGetNotificationsQuery,
} = ChatsService;
