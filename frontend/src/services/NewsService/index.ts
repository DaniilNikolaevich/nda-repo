import type { CreateNewPostFormProps } from '@/components/widgets/CreateNewPost/model';
import { API_ROUTES, BaseApi, HTTP_METHOD } from '@/shared/api';
import type { CommentModel, News, NewsModel } from '@/shared/types/common-models';

const NewsService = BaseApi.enhanceEndpoints({
    addTagTypes: ['NEWS_TAGS', 'ALL_NEWS', 'ALL_COMMENTS'],
}).injectEndpoints({
    endpoints: (build) => ({
        setLike: build.mutation<void, { news_id: string; type: 'like' | string }>({
            query: ({ news_id, ...body }) => ({
                method: HTTP_METHOD.POST,
                url: API_ROUTES.setArticleReaction(news_id),
                body,
            }),
        }),
        getAllNews: build.query<
            NewsModel,
            { search?: string; is_external?: boolean; sortBy?: string; sortDesc?: boolean; page?: number }
        >({
            query: (params) => ({
                method: HTTP_METHOD.GET,
                url: API_ROUTES.news,
                params,
            }),
            providesTags: ['ALL_NEWS'],
        }),
        removeArticle: build.mutation<void, string>({
            query: (articleId) => ({
                method: HTTP_METHOD.DELETE,
                url: API_ROUTES.removeArticle(articleId),
            }),
            invalidatesTags: ['ALL_NEWS'],
        }),
        getNewsTags: build.query<{ id: string; name: string }[], void>({
            query: () => ({
                method: HTTP_METHOD.GET,
                url: API_ROUTES.tags,
            }),
            providesTags: ['NEWS_TAGS'],
        }),
        createNewsTag: build.mutation<{ id: string }, { name: string }>({
            query: (body) => ({
                method: HTTP_METHOD.POST,
                url: API_ROUTES.tags,
                body,
            }),
            invalidatesTags: ['NEWS_TAGS'],
        }),
        createNewArticle: build.mutation<void, CreateNewPostFormProps>({
            query: (body) => ({
                method: HTTP_METHOD.POST,
                url: API_ROUTES.news,
                body: {
                    ...body,
                    tags: body.tags.map((tag) => tag?.id),
                },
            }),
        }),
        uploadArticleCover: build.mutation<{ id: string }, FormData>({
            query: (body) => ({
                method: HTTP_METHOD.POST,
                url: API_ROUTES.documents,
                body,
                formData: true,
            }),
        }),
        getArticleById: build.query<News, string>({
            query: (article_id) => ({
                method: HTTP_METHOD.GET,
                url: API_ROUTES.getArticleById(article_id),
            }),
        }),
        getArticleComments: build.query<CommentModel[], string>({
            query: (article_id) => ({
                method: HTTP_METHOD.GET,
                url: API_ROUTES.getArticleComments(article_id),
            }),
            providesTags: ['ALL_COMMENTS'],
        }),
        createComment: build.mutation<void, { id: string; content: string }>({
            query: ({ id, content }) => ({
                method: HTTP_METHOD.POST,
                url: API_ROUTES.getArticleComments(id),
                body: {
                    content,
                },
            }),
            invalidatesTags: ['ALL_COMMENTS'],
        }),
    }),
});

export const {
    useSetLikeMutation,
    useGetAllNewsQuery,
    useRemoveArticleMutation,
    useGetNewsTagsQuery,
    useCreateNewsTagMutation,
    useCreateNewArticleMutation,
    useUploadArticleCoverMutation,
    useGetArticleByIdQuery,
    useGetArticleCommentsQuery,
    useCreateCommentMutation,
} = NewsService;
