import { useEffect, useState } from 'react';
import { Flex, Radio } from '@mantine/core';

import { useGenerallyDataFormContext } from '../../model';

export const RadioSex = () => {
    const { key, getInputProps, setValues } = useGenerallyDataFormContext();

    const [value, setValue] = useState<string>('0');

    const sexOptions = [
        {
            label: 'Мужской',
            value: '1',
        },
        {
            label: 'Женский',
            value: '2',
        },
        {
            label: 'Не указано',
            value: '0',
        },
    ];

    const handleChange = (value: string) => {
        setValues({
            sex: value,
        });
        setValue(value);
    };

    useEffect(() => {
        setValue(getInputProps('sex').defaultValue);
    }, [getInputProps('sex').defaultValue]);

    return (
        <Radio.Group name={key('sex')} value={value} {...getInputProps('sex')} onChange={handleChange}>
            <Flex direction='column' gap='sm'>
                {sexOptions.map(({ label, value }) => (
                    <Radio value={value} label={label} key={value} />
                ))}
            </Flex>
        </Radio.Group>
    );
};
