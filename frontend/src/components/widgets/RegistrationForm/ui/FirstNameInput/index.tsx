import { TextInput } from '@mantine/core';

import { useRegistrationFormContext } from '@/components/widgets/RegistrationForm/model';

export const FirstNameInput = () => {
    const { key, getInputProps } = useRegistrationFormContext();

    return <TextInput withAsterisk label='Имя' placeholder='Игнат' key={key('name')} {...getInputProps('name')} />;
};
