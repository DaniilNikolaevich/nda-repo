import { createEvent, createStore } from 'effector';

import type {
    AuthorizationResetPasswordDTO,
    AuthorizationSetPasswordDTO,
    AuthorizationSignInDTO,
    AuthorizationSignInResponseDTO,
} from '@/services/AuthorizationService/dto';
import { API_ROUTES, BaseApi, HTTP_METHOD } from '@/shared/api';
import type { ServerMessage } from '@/shared/types/common-models';

import { STORAGE } from '../StorageService';

export const $isAuth = createStore(false);
export const $isRecruiter = createStore<boolean | null>(null);
export const $setAuthState = createEvent<boolean>();
export const $setIsRecruiterState = createEvent<boolean | null>();

$isAuth.on($setAuthState, (_, payload) => payload);
$isRecruiter.on($setIsRecruiterState, (_, payload) => payload);

export const logoutAction = () => {
    STORAGE.clear();
    $setAuthState(false);
    $setIsRecruiterState(null);
    window.location.href = '/';
};

const AuthorizationService = BaseApi.enhanceEndpoints({
    addTagTypes: [],
}).injectEndpoints({
    endpoints: (build) => ({
        registration: build.mutation<ServerMessage, FormData>({
            query: (body) => ({
                method: HTTP_METHOD.POST,
                url: API_ROUTES.register,
                body,
                formData: true,
            }),
        }),
        setPassword: build.mutation<ServerMessage, AuthorizationSetPasswordDTO>({
            query: (body) => ({
                method: HTTP_METHOD.POST,
                url: API_ROUTES.setPassword,
                body,
            }),
        }),
        login: build.mutation<ServerMessage | AuthorizationSignInResponseDTO, AuthorizationSignInDTO>({
            query: (body) => ({
                method: HTTP_METHOD.POST,
                url: API_ROUTES.signIn,
                body,
            }),
        }),
        resetPassword: build.mutation<ServerMessage, AuthorizationResetPasswordDTO>({
            query: (body) => ({
                method: HTTP_METHOD.POST,
                url: API_ROUTES.resetPassword,
                body,
            }),
        }),
        resetPasswordConfirmation: build.mutation<ServerMessage, AuthorizationSetPasswordDTO>({
            query: (body) => ({
                method: HTTP_METHOD.POST,
                url: API_ROUTES.resetPasswordConfirm,
                body,
            }),
        }),
    }),
});

export const {
    useRegistrationMutation,
    useSetPasswordMutation,
    useLoginMutation,
    useResetPasswordMutation,
    useResetPasswordConfirmationMutation,
} = AuthorizationService;
