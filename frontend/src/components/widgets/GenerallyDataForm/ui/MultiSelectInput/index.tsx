import { MultiSelect } from '@mantine/core';
// @ts-ignore import
import { ComboboxData } from '@mantine/core/lib/components/Combobox/Combobox.types';

import { useGenerallyDataFormContext } from '../../model';

export interface MultiSelectInputProps {
    label: string;
    name: string;
    placeholder: string;
    data: ComboboxData;
    disabled?: boolean;
}

export const MultiSelectInput = ({ label, name, data, placeholder, disabled }: MultiSelectInputProps) => {
    const { key, getInputProps } = useGenerallyDataFormContext();

    return (
        <MultiSelect
            key={key(name)}
            name={name}
            label={label}
            data={data}
            placeholder={placeholder}
            searchable
            {...getInputProps(name)}
        />
    );
};
