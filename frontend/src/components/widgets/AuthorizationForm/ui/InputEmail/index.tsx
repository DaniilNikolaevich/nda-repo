import { TextInput } from '@mantine/core';

import { useAuthorizationFormContext } from '@/components/widgets/AuthorizationForm/model';

export const InputEmail = () => {
    const { key, getInputProps } = useAuthorizationFormContext();

    return (
        <TextInput
            withAsterisk
            label='E-mail'
            placeholder='info@mail.ru'
            key={key('email')}
            {...getInputProps('email')}
        />
    );
};
