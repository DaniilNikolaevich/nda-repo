import { TextInput } from '@mantine/core';

import { useVacancyFormContext } from '../../model';
import s from './PhoneInput.module.css';

export interface PhoneInputProps {
    label: string;
    name: string;
    placeholder?: string;
    required?: boolean;
}

export const PhoneInput = ({ label, name, placeholder, required }: PhoneInputProps) => {
    const { key, getInputProps } = useVacancyFormContext();

    return (
        <TextInput
            withAsterisk={required}
            label={label}
            placeholder={placeholder}
            type='text'
            inputMode='tel'
            classNames={{ label: s.label }}
            key={key(name)}
            {...getInputProps(name)}
        />
    );
};
