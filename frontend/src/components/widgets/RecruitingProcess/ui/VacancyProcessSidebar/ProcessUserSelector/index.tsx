import { Button, NumberFormatter, Paper, Stack, Text, UnstyledButton, UnstyledButtonProps } from '@mantine/core';

export const ProcessUserSelector = ({
    title,
    city,
    salary,
    active,
    onClick,
}: UnstyledButtonProps & {
    active?: boolean;
    title?: string;
    city?: string;
    salary?: string | number;
    onClick?: () => void;
}) => (
    <UnstyledButton onClick={onClick}>
        <Paper
            mih={82}
            bg={active ? 'indigo.0' : 'gray.0'}
            py='var(--size-sm)'
            px='var(--size-md)'
            radius='var(--size-md)'
        >
            <Stack gap='var(--size-xxs)'>
                <Text fw={600} fz={14}>
                    {title}
                </Text>
                <Text fz={12}>{city}</Text>
                <Text fw={600} fz={12}>
                    <NumberFormatter suffix=' ₽' value={salary} thousandSeparator=' ' />
                </Text>
            </Stack>
        </Paper>
    </UnstyledButton>
);
