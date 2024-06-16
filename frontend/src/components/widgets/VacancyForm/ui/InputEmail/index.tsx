import { TextInput } from '@mantine/core';

import { useVacancyFormContext } from '../../model';
import s from './InputEmail.module.css';

export const InputEmail = () => {
    const { key, getInputProps } = useVacancyFormContext();

    return (
        <TextInput
            label='E-mail'
            placeholder='info@mail.ru'
            classNames={{ label: s.label }}
            key={key('email')}
            {...getInputProps('email')}
        />
    );
};
