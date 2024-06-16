import { DateInput } from '@mantine/dates';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr/CalendarBlank';

import { useUserEducationFormContext } from '@/components/widgets/UserEducationForm/model';

import s from './GeneralDateInput.module.css';

interface YearInputProps {
    label: string;
    index: number;
    name: string;
    placeholder?: string;
    required?: boolean;
}

export const GeneralDateInput = ({ index, label, name, placeholder, required }: YearInputProps) => {
    const { key, getInputProps } = useUserEducationFormContext();

    return (
        <DateInput
            required={required}
            label={label}
            locale='ru'
            rightSection={<CalendarBlank />}
            classNames={{ label: s.label }}
            placeholder={placeholder}
            key={key(name)}
            {...getInputProps(`education.${index}.${name}.name`)}
        />
    );
};
