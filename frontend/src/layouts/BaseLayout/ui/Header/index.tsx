import {
    ActionIcon,
    AppShell,
    Burger,
    Drawer,
    Flex,
    Indicator,
    useMantineColorScheme,
    VisuallyHidden,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Chats } from '@phosphor-icons/react/dist/ssr/Chats';
import { MoonStars } from '@phosphor-icons/react/dist/ssr/MoonStars';
import { Sun } from '@phosphor-icons/react/dist/ssr/Sun';
import { skipToken } from '@reduxjs/toolkit/query';
import { useUnit } from 'effector-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import PeopleFlowLogo from '@/_app/assets/images/PeopleFlowLogo.svg';
import PeopleFlowDarkLogo from '@/_app/assets/images/PeopleFlowLogoDark.svg';
import { useChat } from '@/_app/providers';
import { $isAuth, STORAGE, useGetAllMyChatsQuery } from '@/services';
import { useIsSmallTablet } from '@/shared/hooks/media';

import { LoginButton } from '../LoginButton';
import { Navigation } from '../Navigation';
import { UserPic } from '../UserPic';

import s from './BaseLayoutHeader.module.scss';

export default function Header() {
    const isAuth = useUnit($isAuth);
    const { pathname } = useRouter();
    const token = STORAGE.getToken();
    const { data: chats } = useGetAllMyChatsQuery(!token ? skipToken : undefined);
    const { messagesCounter } = useChat();

    const isSmallTablet = useIsSmallTablet();
    const [opened, { open, close }] = useDisclosure(false);

    const isChatsExists = chats && chats.chats.length > 0;

    const { colorScheme, setColorScheme } = useMantineColorScheme();
    const isDarkMode = colorScheme === 'dark';

    const onThemeChangeHandler = () => {
        if (isDarkMode) {
            return setColorScheme('light');
        }
        return setColorScheme('dark');
    };

    function Wrapper() {
        if (isSmallTablet) {
            return <Navigation />;
        }

        return (
            <Drawer keepMounted opened={opened} onClose={close}>
                <Navigation />
            </Drawer>
        );
    }

    return (
        <AppShell.Header className={s.root}>
            <Link href='/' className={s.logo}>
                {isDarkMode ? <PeopleFlowDarkLogo /> : <PeopleFlowLogo />}
            </Link>
            <Wrapper />

            <Flex ml='auto' gap='var(--size-sm)'>
                <ActionIcon variant='light' size='lg' onClick={onThemeChangeHandler}>
                    {isDarkMode ? <Sun size={16} weight='bold' /> : <MoonStars size={16} weight='bold' />}
                </ActionIcon>
                {isChatsExists && (
                    <Indicator
                        disabled={messagesCounter?.total === 0}
                        label={messagesCounter?.total}
                        size={20}
                        color='red'
                    >
                        <ActionIcon
                            size='lg'
                            ml='auto'
                            href='/chats'
                            component={Link}
                            variant={pathname.includes('chats') ? '' : 'light'}
                        >
                            <Chats weight={pathname.includes('chats') ? 'fill' : 'regular'} size={16} />
                        </ActionIcon>
                    </Indicator>
                )}
                {isAuth ? <UserPic /> : <LoginButton />}

                {!isSmallTablet && (
                    <Burger onClick={open}>
                        <VisuallyHidden>Открыть навигационное меню</VisuallyHidden>
                    </Burger>
                )}
            </Flex>
        </AppShell.Header>
    );
}

Header.displayName = 'BaseLayout.Header';
