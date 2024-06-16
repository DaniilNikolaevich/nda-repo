import { Select } from '@mantine/core';
// @ts-ignore import
import { ComboboxData } from '@mantine/core/lib/components/Combobox/Combobox.types';

import { useUserExperienceFormContext } from '../../model';

export interface SelectInputProps {
    index: number;
    label: string;
    name: string;
    placeholder: string;
    data: ComboboxData;
    onSearch: (search: string) => void;
}

export const SelectInput = ({ index, label, name, data, placeholder, onSearch }: SelectInputProps) => {
    const { key, getInputProps, setFieldValue } = useUserExperienceFormContext();

    return (
        <Select
            key={key(name)}
            name={name}
            label={label}
            data={data}
            onSearchChange={onSearch}
            placeholder={placeholder}
            searchable
            {...getInputProps(`experience.${index}.${name}.value`)}
            onChange={(value, options) => setFieldValue(`experience.${index}.${name}.value`, options?.value ?? '')}
        />
    );
};
