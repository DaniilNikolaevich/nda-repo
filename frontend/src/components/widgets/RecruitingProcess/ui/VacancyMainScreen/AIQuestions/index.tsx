import { Group, List, Paper, Spoiler, Stack, Text } from '@mantine/core';
import { Sparkle } from '@phosphor-icons/react/dist/ssr/Sparkle';

export const AIQuestions = ({ questions }: { questions?: string[] }) => {
    if (!questions?.length) return null;
    return (
        <Paper>
            <Stack>
                <Group gap='var(--size-xs)'>
                    <Text fw={600} fz={18}>
                        <Sparkle />
                        AI подборка вопросов для собеседования
                    </Text>
                </Group>
                <Spoiler pb={20} maxHeight={120} showLabel='Показать еще' hideLabel='Скрыть вопросы'>
                    <List type='ordered'>
                        {questions?.map((question, idx) => <List.Item key={question + idx}>{question}</List.Item>)}
                    </List>
                </Spoiler>
            </Stack>
        </Paper>
    );
};
