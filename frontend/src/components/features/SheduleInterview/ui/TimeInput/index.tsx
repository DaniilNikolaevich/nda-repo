import { useRef } from 'react';
import { Button } from '@mantine/core';
import { DateInput, TimeInput as TimeInputMantine } from '@mantine/dates';
import { Clock } from '@phosphor-icons/react/dist/ssr/Clock';
import TimePicker from 'rc-time-picker';

import 'rc-time-picker/assets/index.css';

import { useSheduleInterviewFormContext } from '../../model';
import s from './TimeInput.module.css';

interface UserExperienceDateInputProps {
    index: number;
    name: string;
    item: string;
    placeholder?: string;
    required?: boolean;
}

const format = 'h:mm';

export const TimeInput = ({ index, name, item, placeholder, required }: UserExperienceDateInputProps) => {
    const ref = useRef<HTMLInputElement>(null);
    const { key, getInputProps } = useSheduleInterviewFormContext();

    return (
        <TimeInputMantine
            ref={ref}
            disabled={getInputProps(`${item}.${index}.disabled`).defaultValue}
            rightSection={<Clock size={16} />}
            placeholder={placeholder}
            key={key(name)}
            {...getInputProps(`${item}.${index}.${name}.name`)}
            onClick={() => ref.current?.showPicker()}
        />
    );
};
