import { Fragment, useEffect } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import cn from 'clsx';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { setIsRecruiter, STORAGE, useGetAllMyChatsQuery, useIsRecruiter } from '@/services';
import { ROLES, ROLES_TYPE } from '@/shared/types/common-models';

import s from './BaseLayoutNavigation.module.css';

export function Navigation() {
    const router = useRouter();
    const [isRecruiter] = useIsRecruiter();
    const token = STORAGE.getToken() ?? '';
    const role = token && ((jwtDecode(token) ?? {}) as { role: ROLES_TYPE }).role;

    const { data: chats } = useGetAllMyChatsQuery(!token ? skipToken : undefined);

    useEffect(() => {
        if (role === ROLES.RECRUITER) {
            setIsRecruiter(true);
        } else {
            setIsRecruiter(false);
        }
    }, [token]);

    const APP_ROUTES = [
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
    ];

    useEffect(() => {
        if (!chats) return;
        STORAGE.setWebSocketToken(chats.token);
    }, [chats]);

    return (
        <nav>
            {APP_ROUTES.map((route) => (
                <Fragment key={route.id}>
                    {route.visible && (
                        <Link
                            className={cn(s.link, {
                                [s.active]: router.pathname === route.path,
                            })}
                            href={route.path}
                        >
                            {route.name}
                        </Link>
                    )}
                </Fragment>
            ))}
        </nav>
    );
}
