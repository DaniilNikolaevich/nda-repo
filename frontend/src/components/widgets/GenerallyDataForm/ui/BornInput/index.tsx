import { DateInput } from '@mantine/dates';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr/CalendarBlank';

import { useGenerallyDataFormContext } from '@/components/widgets/GenerallyDataForm/model';

import s from './BurnInput.module.css';

interface BornInputProps {
    label: string;
    name: string;
    placeholder?: string;
    required?: boolean;
}

export const BornInput = ({ label, name, placeholder, required }: BornInputProps) => {
    const { key, getInputProps } = useGenerallyDataFormContext();

    return (
        <DateInput
            required={required}
            label={label}
            locale='ru'
            rightSection={<CalendarBlank />}
            classNames={{ label: s.label }}
            placeholder={placeholder}
            key={key(name)}
            {...getInputProps(name)}
        />
    );
};
