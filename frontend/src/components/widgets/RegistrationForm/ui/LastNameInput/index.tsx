import { TextInput } from '@mantine/core';

import { useRegistrationFormContext } from '@/components/widgets/RegistrationForm/model';

export const LastNameInput = () => {
    const { key, getInputProps } = useRegistrationFormContext();

    return (
        <TextInput
            label='Отчество'
            placeholder='Александрович'
            key={key('patronymic')}
            {...getInputProps('patronymic')}
        />
    );
};
