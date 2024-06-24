import { AuthorizationFormProvider, useAuthorizationModel } from '@/components/widgets/AuthorizationForm/model';
import { FormContainer } from '@/shared/ui';

import { Controls, FormTitle, InputEmail, InputPassword } from './ui';

export const AuthorizationForm = () => {
    const { form, onSubmit, isLoading } = useAuthorizationModel();

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
