import { Textarea } from '@mantine/core';

import { useUserExperienceFormContext } from '../../model';
import s from './GeneralTextArea.module.css';

export interface GeneralTextAreaProps {
    label: string;
    index: number;
    name: string;
    autosize?: boolean;
    minRows?: number;
    maxRows?: number;
    placeholder?: string;
    required?: boolean;
}

export const GeneralTextArea = ({
    index,
    autosize,
    minRows,
    maxRows,
    label,
    name,
    placeholder,
    required,
}: GeneralTextAreaProps) => {
    const { key, getInputProps } = useUserExperienceFormContext();

    return (
        <Textarea
            withAsterisk={required}
            label={label}
            minRows={minRows}
            maxRows={maxRows}
            autosize={autosize}
            placeholder={placeholder}
            classNames={{ label: s.label }}
            key={key(name)}
            {...getInputProps(`experience.${index}.${name}.name`)}
        />
    );
};
