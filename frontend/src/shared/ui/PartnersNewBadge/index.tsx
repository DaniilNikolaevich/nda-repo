import { Paper, Text, useMantineColorScheme } from '@mantine/core';

export const PartnersNewsBadge = ({ hidden = false, ml = 'auto' }: { hidden?: boolean; ml?: string | number }) => {
    const { colorScheme } = useMantineColorScheme();
    const isDarkMode = colorScheme === 'dark';

    return (
        <Paper ml={ml} px={8} hidden={hidden} py={4} radius='var(--size-xxs)' bg={isDarkMode ? 'dark.3' : '#EDF2FF'}>
            <Text fz={14} lh={1.25} c={isDarkMode ? 'white' : 'var(--accent)'}>
                Новости от партнеров
            </Text>
        </Paper>
    );
};
