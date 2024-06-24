import { memo } from 'react';
import { Button, Flex } from '@mantine/core';
import Link from 'next/link';

export const Controls = memo(() => (
    <Flex gap='lg'>
        <Button variant='outline' type='reset'>
            Отмена
        </Button>
        <Button type='submit'>Сохранить</Button>
    </Flex>
));

Controls.displayName = 'AuthorizationControls';
