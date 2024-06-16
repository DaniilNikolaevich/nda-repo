import { Select } from '@mantine/core';
// @ts-ignore import
import { ComboboxData } from '@mantine/core/lib/components/Combobox/Combobox.types';

import { useVacancyFormContext } from '../../model';

export interface SelectInputProps {
    label: string;
    name: string;
    placeholder: string;
    data: ComboboxData;
}

export const SelectInput = ({ label, name, data, placeholder }: SelectInputProps) => {
    const { key, getInputProps, setFieldValue } = useVacancyFormContext();

    return (
        <Select
            key={key(name)}
            name={name}
            multiple
            label={label}
            data={data}
            placeholder={placeholder}
            searchable
            {...getInputProps(name)}
            onChange={(value, options) => setFieldValue(name, options?.value ?? '')}
        />
    );
};
