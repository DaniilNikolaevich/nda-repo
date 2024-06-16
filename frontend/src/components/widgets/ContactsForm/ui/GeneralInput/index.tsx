import { TextInput } from '@mantine/core';

import { useUserContactsFormContext } from '../../model';
import s from './GeneralInput.module.css';

export interface GeneralInputProps {
    label: string;
    name: string;
    index: number;
    prefix: string;
    placeholder?: string;
    required?: boolean;
}

export const GeneralInput = ({ prefix, index, label, name, placeholder, required }: GeneralInputProps) => {
    const { key, getInputProps } = useUserContactsFormContext();

    return (
        <TextInput
            withAsterisk={required}
            label={label}
            prefix={prefix}
            placeholder={placeholder}
            type='text'
            key={key(name)}
            classNames={{ label: s.label }}
            {...getInputProps(`${prefix}.${index}.${name}.value`)}
        />
    );
};
