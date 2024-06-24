import {
    NumberFormatter,
    Paper,
    Stack,
    Text,
    UnstyledButton,
    type UnstyledButtonProps,
    useMantineColorScheme,
} from '@mantine/core';

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
}) => {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const getCardColorScheme = (isActive?: boolean) => {
        if (isDark) {
            return isActive ? 'dark.2' : 'dark.4';
        }

        return isActive ? 'indigo.0' : 'gray.0';
    };

    return (
        <UnstyledButton onClick={onClick}>
            <Paper
                mih={82}
                bg={getCardColorScheme(active)}
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
};
