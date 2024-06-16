import type { PropsWithChildren } from 'react';
import { Box } from '@mantine/core';

export function CabinetLayout({ children }: PropsWithChildren) {
    return (
        <>
            <Box style={{ width: '100%' }}>{children}</Box>
        </>
    );
}
