import { Select } from '@mantine/core';
// @ts-ignore import
import { ComboboxData } from '@mantine/core/lib/components/Combobox/Combobox.types';

import { useUserEducationFormContext } from '../../model';

export interface SelectInputProps {
    index: number;
    label: string;
    name: string;
    placeholder: string;
    data: ComboboxData;
    onSearch: (search: string) => void;
}

export const SelectInput = ({ index, label, onSearch, name, data, placeholder }: SelectInputProps) => {
    const { key, getInputProps, setFieldValue } = useUserEducationFormContext();

    return (
        <Select
            key={key(name)}
            name={name}
            label={label}
            data={data}
            onSearchChange={onSearch}
            placeholder={placeholder}
            searchable
            {...getInputProps(`education.${index}.${name}.value`)}
            onChange={(value, options) => setFieldValue(`education.${index}.${name}.value`, options?.value ?? '')}
        />
    );
};
