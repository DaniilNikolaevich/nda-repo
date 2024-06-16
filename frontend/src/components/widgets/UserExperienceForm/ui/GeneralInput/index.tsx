import { TextInput } from '@mantine/core';

import { useUserExperienceFormContext } from '../../model';
import s from './GeneralInput.module.css';

export interface GeneralInputProps {
    label: string;
    name: string;
    index: number;
    item: string;
    placeholder?: string;
    required?: boolean;
}

export const GeneralInput = ({ index, label, name, item, placeholder, required }: GeneralInputProps) => {
    const { key, getInputProps } = useUserExperienceFormContext();

    return (
        <TextInput
            withAsterisk={required}
            label={label}
            placeholder={placeholder}
            type='text'
            key={key(name)}
            classNames={{ label: s.label }}
            {...getInputProps(`experience.${index}.${name}.${item}`)}
        />
    );
};
