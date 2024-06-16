import { Paper, Text } from '@mantine/core';

export const PartnersNewsBadge = ({ hidden = false, ml = 'auto' }: { hidden?: boolean; ml?: string | number }) => (
    <Paper ml={ml} px={8} hidden={hidden} py={4} radius='var(--size-xxs)' bg='#EDF2FF'>
        <Text fz={14} lh={1.25} c='var(--accent)'>
            Новости от партнеров
        </Text>
    </Paper>
);
