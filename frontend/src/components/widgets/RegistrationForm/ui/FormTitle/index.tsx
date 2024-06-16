import { memo } from 'react';
import { Center, Title } from '@mantine/core';

export const FormTitle = memo(() => (
    <Center>
        <Title mb='lg' order={2}>
            Регистрация
        </Title>
    </Center>
));

FormTitle.displayName = 'RegistrationFormTitle';
