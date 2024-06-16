import { Select } from '@mantine/core';
// @ts-ignore import
import { ComboboxData } from '@mantine/core/lib/components/Combobox/Combobox.types';

import { useGenerallyDataFormContext } from '../../model';

export interface SelectInputProps {
    label: string;
    name: string;
    placeholder: string;
    data: ComboboxData;
    onSearchValue: (search: string) => void;
}

export const SelectInput = ({ label, name, data, placeholder, onSearchValue }: SelectInputProps) => {
    const { key, getInputProps, setFieldValue } = useGenerallyDataFormContext();

    return (
        <Select
            key={key(name)}
            name={name}
            label={label}
            onSearchChange={onSearchValue}
            data={data}
            placeholder={placeholder}
            searchable
            {...getInputProps(name)}
            onChange={(value, options) => setFieldValue(name, options?.value ?? '')}
        />
    );
};
