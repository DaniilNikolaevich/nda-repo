import type { ComponentProps } from 'react';
import { Center, Flex, type FlexProps } from '@mantine/core';

import { useIsDesktop } from '@/shared/hooks/media';

interface FormContainerProps extends ComponentProps<'form'> {
    gap?: FlexProps['gap'];
    direction?: FlexProps['direction'];
    maw?: number | string;
    px?: number | string;
    py?: number | string;
    bg?: string;
    centered?: boolean;
}

export const FormContainer = ({
    children,
    gap = 'lg',
    direction = 'column',
    maw,
    centered = false,
    py = 60,
    px = 40,
    bg = 'white',
    className,
    ...props
}: FormContainerProps) => {
    const isDesktop = useIsDesktop();
    return (
        <Center h={centered && isDesktop ? 'calc(100vh - 92px)' : ''} className={className}>
            <Flex maw={maw} direction='column' w='100%' px={px} py={py} bg={bg} style={{ borderRadius: 16 }}>
                <form style={{ width: '100%' }} {...props}>
                    <Flex gap={gap} direction={direction}>
                        {children}
                    </Flex>
                </form>
            </Flex>
        </Center>
    );
};
