import { TextInput } from '@mantine/core';

import { useUserEducationFormContext } from '../../model';
import s from './GeneralInput.module.css';

export interface GeneralInputProps {
    label: string;
    name: string;
    index: number;
    placeholder?: string;
    required?: boolean;
}

export const GeneralInput = ({ index, label, name, placeholder, required }: GeneralInputProps) => {
    const { key, getInputProps } = useUserEducationFormContext();

    return (
        <TextInput
            withAsterisk={required}
            label={label}
            placeholder={placeholder}
            type='text'
            key={key(name)}
            classNames={{ label: s.label }}
            {...getInputProps(`education.${index}.${name}.name`)}
        />
    );
};
