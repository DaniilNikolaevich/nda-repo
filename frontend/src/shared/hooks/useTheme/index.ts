import { useEffect, useState } from 'react';
import { useMantineColorScheme } from '@mantine/core';

export const useTheme = () => {
    const { colorScheme } = useMantineColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const [background, setBackground] = useState('dark.4');

    useEffect(() => {
        if (isDarkMode) {
            return setBackground('dark.4');
        }

        setBackground('white');
    }, [isDarkMode]);

    return {
        isDarkMode,
        setBackground,
        background,
    };
};
