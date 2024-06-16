import { TextInput } from '@mantine/core';

import { useRegistrationFormContext } from '@/components/widgets/RegistrationForm/model';

export const InputEmail = () => {
    const { key, getInputProps } = useRegistrationFormContext();

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
