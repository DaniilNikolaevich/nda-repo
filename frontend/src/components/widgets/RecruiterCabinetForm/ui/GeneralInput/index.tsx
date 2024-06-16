import { TextInput } from '@mantine/core';

import { useRecruiterCabinetFormContext } from '../../model';
import s from './GeneralInput.module.css';

export interface GeneralInputProps {
    label: string;
    name: string;
    placeholder?: string;
    required?: boolean;
}

export const GeneralInput = ({ label, name, placeholder, required }: GeneralInputProps) => {
    const { key, getInputProps } = useRecruiterCabinetFormContext();

    return (
        <TextInput
            withAsterisk={required}
            label={label}
            placeholder={placeholder}
            type='text'
            key={key(name)}
            classNames={{ label: s.label }}
            {...getInputProps(name)}
        />
    );
};
