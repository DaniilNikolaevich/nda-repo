import { useMediaQuery } from '@mantine/hooks';

export const useIsDesktop = () => useMediaQuery('(min-width: 992px');

export const useIsLaptop = () => useMediaQuery('(min-width: 1140px');

export const useIsTablet = () => useMediaQuery('(min-width: 875px');

export const useIsSmallTablet = () => useMediaQuery('(min-width: 450px');
