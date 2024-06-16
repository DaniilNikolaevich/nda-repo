import { DateInput, DatePickerInput } from '@mantine/dates';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr/CalendarBlank';

import { useUserExperienceFormContext } from '../../model';
import s from './WorkPeriod.module.css';

interface WorkPeriodProps {
    label: string;
    name: string;
    index: number;
    placeholder?: string;
    required?: boolean;
}

export const WorkPeriod = ({ index, label, name, placeholder, required }: WorkPeriodProps) => {
    const { key, getInputProps } = useUserExperienceFormContext();

    return (
        <DatePickerInput
            type='range'
            required={required}
            label={label}
            locale='ru'
            rightSection={<CalendarBlank />}
            classNames={{ label: s.label }}
            placeholder={placeholder}
            key={key(name)}
            {...getInputProps(`experience.${index}.${name}.period`)}
        />
    );
};
