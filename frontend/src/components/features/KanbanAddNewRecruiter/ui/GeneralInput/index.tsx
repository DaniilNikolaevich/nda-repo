import { TextInput } from '@mantine/core';

import { useAddNewRecruiterFormContext } from '../../model';
import s from './GeneralInput.module.css';

export interface GeneralInputProps {
    label: string;
    name: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
}

export const GeneralInput = ({ label, type = 'text', name, placeholder, required, disabled }: GeneralInputProps) => {
    const { key, getInputProps } = useAddNewRecruiterFormContext();

    return (
        <TextInput
            withAsterisk={required}
            label={label}
            placeholder={placeholder}
            type={type}
            disabled={disabled}
            key={key(name)}
            classNames={{ label: s.label }}
            {...getInputProps(name)}
        />
    );
};
