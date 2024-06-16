import { PasswordInput } from '@mantine/core';

import { useAuthorizationFormContext } from '@/components/widgets/AuthorizationForm/model';

export const InputPassword = () => {
    const { key, getInputProps } = useAuthorizationFormContext();

    return (
        <PasswordInput
            withAsterisk
            label='Пароль'
            placeholder='Введите пароль'
            type='password'
            key={key('password')}
            {...getInputProps('password')}
        />
    );
};
