import { useRef } from 'react';
import { TimeInput as TimeInputMantine } from '@mantine/dates';
import { Clock } from '@phosphor-icons/react/dist/ssr/Clock';

import 'rc-time-picker/assets/index.css';

import { useAutoGenerateTimeSlotsFormContext } from '../../model';

interface UserExperienceDateInputProps {
    name: string;
    label: string;
    placeholder?: string;
    required?: boolean;
}

export const TimeInput = ({ name, placeholder, label, required }: UserExperienceDateInputProps) => {
    const ref = useRef<HTMLInputElement>(null);
    const { key, getInputProps } = useAutoGenerateTimeSlotsFormContext();

    return (
        <TimeInputMantine
            ref={ref}
            styles={{
                label: {
                    fontWeight: 600,
                },
            }}
            rightSection={<Clock size={16} />}
            placeholder={placeholder}
            label={label}
            key={key(name)}
            {...getInputProps(`${name}.name`)}
            onClick={() => ref.current?.showPicker()}
        />
    );
};
