import { Group, Paper, Spoiler, Stack, Text } from '@mantine/core';
import { Sparkle } from '@phosphor-icons/react/dist/ssr/Sparkle';

export const AISummary = ({ summary }: { summary?: string }) => {
    if (!summary) return;

    return (
        <Paper
            maw={720}
            mb='var(--size-md)'
            py='var(--size-sm)'
            px='var(--size-md)'
            radius='var(--size-md)'
            bg='indigo.0'
        >
            <Stack>
                <Text fw='bold'>
                    <Group gap='var(--size-xs)'>
                        <Sparkle weight='bold' />
                        AI саммари резюме соискателя
                    </Group>
                </Text>
                <Spoiler pb='20px' maxHeight={126} hideLabel='Скрыть саммари' showLabel='Показать еще'>
                    <Text fz={14}>{summary}</Text>
                </Spoiler>
            </Stack>
        </Paper>
    );
};
