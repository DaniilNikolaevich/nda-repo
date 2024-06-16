import { DateInput } from '@mantine/dates';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr/CalendarBlank';

import { useUserExperienceFormContext } from '../../model';
import s from './UserExperienceDateInput.module.css';

interface UserExperienceDateInputProps {
    label: string;
    index: number;
    name: string;
    placeholder?: string;
    required?: boolean;
}

export const UserExperienceDateInput = ({
    index,
    label,
    name,
    placeholder,
    required,
}: UserExperienceDateInputProps) => {
    const { key, getInputProps } = useUserExperienceFormContext();

    return (
        <DateInput
            required={required}
            label={label}
            locale='ru'
            rightSection={<CalendarBlank />}
            classNames={{ label: s.label }}
            placeholder={placeholder}
            key={key(name)}
            {...getInputProps(`experience.${index}.${name}.name`)}
        />
    );
};
