import { Center, Loader } from '@mantine/core';
import { isNull } from 'lodash-es';

import { AuthorizationFormProvider, useAuthorizationModel } from '@/components/widgets/AuthorizationForm/model';
import { useAuthorization } from '@/services';
import { FormContainer } from '@/shared/ui';

import { Controls, FormTitle, InputEmail, InputPassword } from './ui';

export const AuthorizationForm = () => {
    const [isAuthorize] = useAuthorization();
    const { form, onSubmit, isLoading } = useAuthorizationModel();
    if (isNull(isAuthorize) || isAuthorize) {
        return (
            <Center pos='absolute' top='50%' left='50%'>
                <Loader />
            </Center>
        );
    }

    return (
        <AuthorizationFormProvider form={form}>
            <FormContainer maw={450} centered onSubmit={onSubmit}>
                <FormTitle />
                <InputEmail />
                <InputPassword />
                <Controls isLoading={isLoading} />
            </FormContainer>
        </AuthorizationFormProvider>
    );
};
