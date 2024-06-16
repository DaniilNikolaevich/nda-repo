import { useEffect } from 'react';
import { createFormContext } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { jwtDecode } from 'jwt-decode';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useRouter } from 'next/router';
import { z } from 'zod';

import { setAuthorization, STORAGE, useLoginMutation } from '@/services';
import { isServerError } from '@/shared/types';
import { AuthorizationSchema } from '@/shared/validate';

type AuthorizationFormProps = z.infer<typeof AuthorizationSchema>;

export const [AuthorizationFormProvider, useAuthorizationFormContext, useAuthorizationForm] =
    createFormContext<AuthorizationFormProps>();

export const useAuthorizationModel = () => {
    const router = useRouter();
    const form = useAuthorizationForm({
        mode: 'uncontrolled',
        initialValues: {
            email: '',
            password: '',
        },
        validate: zodResolver(AuthorizationSchema),
    });

    const [signIn, { data, isLoading }] = useLoginMutation();

    const onSubmit = form.onSubmit(async (values) => {
        try {
            await signIn(values).unwrap();
        } catch (e) {
            if (isServerError(e)) {
                notifications.show({
                    title: 'Произошла ошибка!',
                    message: e.data.message,
                    color: 'red',
                });
            }
        }
    });

    useEffect(() => {
        if (!data || !('access_token' in data)) return;
        STORAGE.setToken(data.access_token);
        STORAGE.setRefreshToken(data.refresh_token);
        setAuthorization(true);
        const role = (jwtDecode(data.access_token) as { role: number }).role === 2 ? 'recruiter' : 'user';
        STORAGE.setRole(role);
        router.push(`${role === 'recruiter' ? '/recruiter/process/recruiting' : '/vacancies'}`);
    }, [data]);

    useEffect(() => {
        const token = STORAGE.getToken();

        if (token) {
            const role = (jwtDecode(token) as { role: number }).role === 2 ? 'recruiter' : 'user';
            STORAGE.setRole(role);
            router.push(`${role === 'recruiter' ? '/recruiter/process/recruiting' : '/vacancies'}`);
        } else {
            setAuthorization(false);
        }
    }, []);

    return {
        form,
        onSubmit,
        isLoading,
    };
};
