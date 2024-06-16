import { useEffect } from 'react';
import { createFormContext } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';

import { useRegistrationMutation } from '@/services';
import { isServerError } from '@/shared/types';
import { dataFormObject } from '@/shared/utils';
import { RegistrationSchema } from '@/shared/validate';

type RegistrationFormProps = z.infer<typeof RegistrationSchema>;

export const [RegistrationFormProvider, useRegistrationFormContext, useRegistrationForm] =
    createFormContext<RegistrationFormProps>();

export const useRegistration = () => {
    const form = useRegistrationForm({
        mode: 'uncontrolled',
        name: 'registration-form',
        initialValues: {
            surname: '',
            name: '',
            patronymic: '',
            email: '',
            cv_file: null,
        },
        validate: zodResolver(RegistrationSchema),
    });

    const [register, { isSuccess, data, isLoading }] = useRegistrationMutation();

    const onSubmit = form.onSubmit(async (values) => {
        const formData = dataFormObject(values);
        try {
            await register(formData).unwrap();
        } catch (e) {
            if (e instanceof Error) {
                console.error(e.message);
            }
            if (isServerError(e)) {
                notifications.show({
                    title: 'Произошла ошибка!',
                    message: e.data.message,
                });
            }
        }
    });

    useEffect(() => {
        if (isSuccess) {
            notifications.show({
                title: 'Регистрация прошла успешно!',
                message: data.message,
            });
        }
    }, [isSuccess]);

    return {
        form,
        onSubmit,
        isLoading,
        isSuccess,
    };
};
