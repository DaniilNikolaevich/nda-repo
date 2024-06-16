import { TagsInput } from '@mantine/core';

import { DepartmentsType } from '@/shared/types/common-models/Departments';

import { useGenerallyDataFormContext } from '../../model';
import s from './PhoneInput.module.css';

export interface KeySkillsProps {
    label: string;
    name: string;
    data: Array<string>;
    onSearch: (search: string) => void;
    placeholder?: string;
    required?: boolean;
}

export const KeySkills = ({ label, name, placeholder, data, onSearch, required }: KeySkillsProps) => {
    const { key, getInputProps } = useGenerallyDataFormContext();

    return (
        <TagsInput
            label={label}
            placeholder={placeholder}
            data={data}
            onSearchChange={onSearch}
            classNames={{ label: s.label }}
            key={key(name)}
            {...getInputProps(name)}
        />
    );
};
