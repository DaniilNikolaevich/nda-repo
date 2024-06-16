import { memo } from 'react';
import { Title } from '@mantine/core';

export const FormTitle = memo(() => <Title order={2}>Вход</Title>);

FormTitle.displayName = 'AuthorizationFormTitle';
