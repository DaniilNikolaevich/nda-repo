import { ActionIcon, AppShell, Flex } from '@mantine/core';
import { Chats } from '@phosphor-icons/react/dist/ssr/Chats';
import { skipToken } from '@reduxjs/toolkit/query';
import Link from 'next/link';
import { useRouter } from 'next/router';

import PeopleFlowLogo from '@/_app/assets/images/PeopleFlowLogo.svg';
import { STORAGE, useAuthorization, useGetAllMyChatsQuery } from '@/services';

import { LoginButton } from '../LoginButton';
import { Navigation } from '../Navigation';
import { UserPic } from '../UserPic';

import s from './BaseLayoutHeader.module.scss';

export function Header() {
    const { pathname } = useRouter();
    const token = STORAGE.getToken();
    const { data: chats } = useGetAllMyChatsQuery(!token ? skipToken : undefined);
    const [isAuthorized] = useAuthorization();

    const isChatsExists = chats && chats.chats.length > 0;

    return (
        <AppShell.Header className={s.root}>
            <Link href='/' className={s.logo}>
                <PeopleFlowLogo />
            </Link>
            <Navigation />

            <Flex ml='auto' gap='var(--size-sm)'>
                {isChatsExists && (
                    <ActionIcon
                        size='lg'
                        component={Link}
                        href='/chats'
                        variant={pathname.includes('chats') ? '' : 'light'}
                        ml='auto'
                    >
                        <Chats weight='fill' size={16} />
                    </ActionIcon>
                )}
                {isAuthorized ? <UserPic /> : <LoginButton />}
            </Flex>
        </AppShell.Header>
    );
}

Header.displayName = 'BaseLayout.Header';
