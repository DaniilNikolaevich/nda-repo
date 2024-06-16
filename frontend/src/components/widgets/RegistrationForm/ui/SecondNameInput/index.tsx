import { TextInput } from '@mantine/core';

import { useRegistrationFormContext } from '@/components/widgets/RegistrationForm/model';

export const SecondNameInput = () => {
    const { key, getInputProps } = useRegistrationFormContext();

    return <TextInput label='Фамилия' placeholder='Пирогов' key={key('surname')} {...getInputProps('surname')} />;
};
