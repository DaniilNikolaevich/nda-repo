import { useMediaQuery, useViewportSize } from '@mantine/hooks';

export const useIsDesktop = () => {
    const isDesktopMedia = useMediaQuery('(min-width: 992px');
    const { height } = useViewportSize();

    return isDesktopMedia && height > 850;
};

export const useIsLaptop = () => {
    const isLaptopMedia = useMediaQuery('(min-width: 1140px');
    const { height } = useViewportSize();

    return isLaptopMedia && height > 850;
};

export const useIsTablet = () => {
    const isTabletMedia = useMediaQuery('(min-width: 875px');
    const { height } = useViewportSize();

    return isTabletMedia && height > 850;
};

export const useIsSmallTablet = () => {
    const isSmallTabletMedia = useMediaQuery('(min-width: 450px');
    const { height } = useViewportSize();

    return isSmallTabletMedia && height > 850;
};
