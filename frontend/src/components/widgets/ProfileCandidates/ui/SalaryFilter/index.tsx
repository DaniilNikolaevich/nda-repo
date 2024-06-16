import { NumberFormatter, Radio, RadioGroupProps, Stack } from '@mantine/core';

export const SalaryFilter = ({
    value,
    onChange,
}: {
    value: RadioGroupProps['value'];
    onChange: RadioGroupProps['onChange'];
}) => (
    <Radio.Group name='salary' label='Зарплата, ₽' value={value} onChange={onChange}>
        <Stack gap='var(--size-sm)'>
            <Radio value='' label='Все' />
            <Radio value='$exists' label='Указана' />
            <Radio value='100000' label={<NumberFormatter prefix='от ' thousandSeparator=' ' value={100000} />} />
            <Radio value='200000' label={<NumberFormatter prefix='от ' thousandSeparator=' ' value={200000} />} />
            <Radio value='250000' label={<NumberFormatter prefix='от ' thousandSeparator=' ' value={250000} />} />
            <Radio value='350000' label={<NumberFormatter prefix='от ' thousandSeparator=' ' value={350000} />} />
        </Stack>
    </Radio.Group>
);
