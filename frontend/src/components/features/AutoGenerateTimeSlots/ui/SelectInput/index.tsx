import { Select } from '@mantine/core';
// @ts-ignore import
import { ComboboxData } from '@mantine/core/lib/components/Combobox/Combobox.types';

import { useAutoGenerateTimeSlotsFormContext } from '../../model';

export interface SelectInputProps {
    label: string;
    name: string;
    data: ComboboxData;
    placeholder?: string;
}

export const SelectInput = ({ label, name, data, placeholder }: SelectInputProps) => {
    const { key, getInputProps } = useAutoGenerateTimeSlotsFormContext();

    return (
        <Select
            key={key(name)}
            name={name}
            styles={{
                label: {
                    fontWeight: 600,
                },
            }}
            label={label}
            data={data}
            placeholder={placeholder}
            searchable
            {...getInputProps(`${name}.name`)}
        />
    );
};
