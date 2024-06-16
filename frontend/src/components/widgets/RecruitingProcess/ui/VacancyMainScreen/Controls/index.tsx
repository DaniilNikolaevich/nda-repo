import { Button, Group } from '@mantine/core';
import { ChatDots } from '@phosphor-icons/react/dist/ssr/ChatDots';
import { FileText } from '@phosphor-icons/react/dist/ssr/FileText';

export const Controls = () => (
    <Group mb='var(--size-xl)'>
        <Button leftSection={<FileText weight='bold' size={20} />} variant='light'>
            Резюме
        </Button>
        <Button bg='gray.2' c='black' leftSection={<ChatDots weight='bold' size={20} />}>
            В чат
        </Button>
    </Group>
);
