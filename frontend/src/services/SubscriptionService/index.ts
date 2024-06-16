import { API_ROUTES, BaseApi, HTTP_METHOD } from '@/shared/api';

const SubscriptionService = BaseApi.enhanceEndpoints({}).injectEndpoints({
    endpoints: (build) => ({
        emailSubscribe: build.mutation<void, { email: string }>({
            query: (body) => ({
                method: HTTP_METHOD.POST,
                url: API_ROUTES.subscribe,
                body,
            }),
        }),
    }),
});

export const { useEmailSubscribeMutation } = SubscriptionService;
