import { Textarea } from '@mantine/core';

import { useGenerallyDataFormContext } from '../../model';
import s from './GeneralTextArea.module.css';

export interface GeneralTextAreaProps {
    label: string;
    name: string;
    autosize?: boolean;
    minRows?: number;
    maxRows?: number;
    placeholder?: string;
    required?: boolean;
}

export const GeneralTextArea = ({
    autosize,
    minRows,
    maxRows,
    label,
    name,
    placeholder,
    required,
}: GeneralTextAreaProps) => {
    const { key, getInputProps } = useGenerallyDataFormContext();

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
            {...getInputProps(name)}
        />
    );
};
