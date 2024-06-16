import { useDispatch, useSelector, useStore } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import { BaseApi } from '@/shared/api';

export const makeStore = () =>
    configureStore({
        reducer: {
            [BaseApi.reducerPath]: BaseApi.reducer,
        },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware({}).concat(BaseApi.middleware),
    });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
