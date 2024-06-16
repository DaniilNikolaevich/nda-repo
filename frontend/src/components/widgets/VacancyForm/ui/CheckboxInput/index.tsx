import { Checkbox } from '@mantine/core';

import { useVacancyFormContext } from '../../model';
import s from './CheckboxInput.module.css';

export interface CheckboxInputProps {
    label: string;
    name: string;
    disabled?: boolean;
}

export const CheckboxInput = ({ label, name, disabled }: CheckboxInputProps) => {
    const { key, getInputProps } = useVacancyFormContext();

    return (
        <Checkbox
            label={label}
            disabled={disabled}
            key={key(name)}
            defaultChecked={getInputProps(name).defaultValue}
            classNames={{ label: s.label }}
            {...getInputProps(name)}
        />
    );
};
