import { CheckEmailMessage } from '@/components/entities';
import { FormContainer } from '@/shared/ui';

import { RegistrationFormProvider, useRegistration } from './model';
import { Controls, CVInput, FirstNameInput, FormTitle, InputEmail, LastNameInput, SecondNameInput } from './ui';

export const RegistrationForm = () => {
    const { form, onSubmit, isLoading, isSuccess } = useRegistration();

    return (
        <RegistrationFormProvider form={form}>
            <FormContainer centered maw={isSuccess ? 430 : 526} id='registration-form' onSubmit={onSubmit}>
                {isSuccess ? (
                    <CheckEmailMessage email={form.getValues().email} />
                ) : (
                    <>
                        <FormTitle />
                        <FirstNameInput />
                        <SecondNameInput />
                        <LastNameInput />
                        <InputEmail />
                        <CVInput />
                        <Controls isLoading={isLoading} />
                    </>
                )}
            </FormContainer>
        </RegistrationFormProvider>
    );
};
