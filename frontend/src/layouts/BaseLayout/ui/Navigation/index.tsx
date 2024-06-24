import { Fragment, useEffect, useMemo } from 'react';
import { Button, useMantineColorScheme } from '@mantine/core';
import { skipToken } from '@reduxjs/toolkit/query';
import cn from 'clsx';
import { useUnit } from 'effector-react';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { $isAuth, $isRecruiter, $setIsRecruiterState, STORAGE, useGetAllMyChatsQuery } from '@/services';
import { ROLES, ROLES_TYPE } from '@/shared/types/common-models';

import s from './BaseLayoutNavigation.module.scss';

export function Navigation() {
    const router = useRouter();
    const isRecruiter = useUnit($isRecruiter);
    const isAuth = useUnit($isAuth);
    const token = STORAGE.getToken() ?? '';
    const role = token && ((jwtDecode(token) ?? {}) as { role: ROLES_TYPE }).role;
    const { colorScheme } = useMantineColorScheme();

    const isDarkTheme = colorScheme === 'dark';

    const { data: chats } = useGetAllMyChatsQuery(!token ? skipToken : undefined);

    const APP_ROUTES = useMemo(
        () => [
            {
                id: 0,
                path: '/',
                name: 'Лента',
                visible: true,
            },
            {
                id: 1,
                path: '/vacancies',
                name: 'Вакансии',
                visible: true,
            },
            {
                id: 2,
                path: '/recruiter/process/recruiting',
                name: 'Управление процессом',
                visible: isRecruiter,
            },
            {
                id: 3,
                path: '/responses',
                name: 'Отклики',
                visible: isAuth && !isRecruiter,
            },
        ],
        [isRecruiter]
    );

    const getColorLinks = (isActive: boolean) => {
        if (isDarkTheme) {
            return isActive ? 'indigo.3' : 'white';
        }

        return isActive ? 'indigo.8' : 'black';
    };

    useEffect(() => {
        if (!chats) return;
        STORAGE.setWebSocketToken(chats.token);
    }, [chats]);

    useEffect(() => {
        if (role === ROLES.RECRUITER) {
            $setIsRecruiterState(true);
        } else {
            $setIsRecruiterState(false);
        }
    }, [token]);

    return (
        <nav className={s.root}>
            {APP_ROUTES.map((route) => (
                <Fragment key={route.id}>
                    {route.visible && (
                        <Button
                            variant='subtle'
                            component={Link}
                            href={route.path}
                            className={cn(s.link, {
                                [s.active]: router.route === route.path,
                            })}
                            c={getColorLinks(router.route === route.path)}
                            px={0}
                            radius={0}
                            fw={router.asPath === route.path ? 600 : 400}
                        >
                            {route.name}
                        </Button>
                    )}
                </Fragment>
            ))}
        </nav>
    );
}
