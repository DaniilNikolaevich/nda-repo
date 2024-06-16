import { Checkbox } from '@mantine/core';

import { useUserContactsFormContext } from '../../model';
import s from './CheckboxInput.module.css';

export interface CheckboxInputProps {
    label: string;
    name: string;
    prefix: string;
    index: number;
    disabled?: boolean;
}

export const CheckboxInput = ({ prefix, index, label, name, disabled }: CheckboxInputProps) => {
    const { key, getInputProps } = useUserContactsFormContext();

    return (
        <Checkbox
            label={label}
            disabled={disabled}
            key={key(name)}
            classNames={{ label: s.label }}
            defaultChecked={getInputProps(`${prefix}.${index}.${name}.is_preferred`).defaultValue}
            {...getInputProps(`${prefix}.${index}.${name}.is_preferred`)}
        />
    );
};
