import { memo } from 'react';
import { Button, Flex } from '@mantine/core';
import Link from 'next/link';

export const Controls = memo(({ isEditMode }: { isEditMode: boolean }) => (
    <Flex gap='xl' pt='xl'>
        <Button type='reset'>Отмена</Button>
        <Button type='submit'>Сохранить вакансию</Button>
    </Flex>
));

Controls.displayName = 'AuthorizationControls';
