import { Textarea } from '@mantine/core';

import { useRecruiterCabinetFormContext } from '../../model';

export interface GeneralTextAreaProps {
    label: string;
    name: string;
    placeholder?: string;
    required?: boolean;
}

export const GeneralTextArea = ({ label, name, placeholder, required }: GeneralTextAreaProps) => {
    const { key, getInputProps } = useRecruiterCabinetFormContext();

    return (
        <Textarea
            styles={{
                label: {
                    fontWeight: 'bold',
                    fontSize: 14,
                },
            }}
            rows={5}
            withAsterisk={required}
            label={label}
            placeholder={placeholder}
            key={key(name)}
            {...getInputProps(name)}
        />
    );
};
