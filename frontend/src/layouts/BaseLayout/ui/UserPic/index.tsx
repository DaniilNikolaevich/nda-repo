import { Avatar, Menu } from '@mantine/core';
import { Gear } from '@phosphor-icons/react/dist/ssr/Gear';
import { SignOut } from '@phosphor-icons/react/dist/ssr/SignOut';
import { UserCircle } from '@phosphor-icons/react/dist/ssr/UserCircle';
import { skipToken } from '@reduxjs/toolkit/query';
import { useUnit } from 'effector-react';
import { isNull } from 'lodash-es';
import Link from 'next/link';

import {
    $isAuth,
    $isRecruiter,
    logoutAction,
    STORAGE,
    useGetInfoRecruiterByMeQuery,
    useGetMainInfoByMeQuery,
} from '@/services';

import s from './UserPic.module.css';

export function UserPic() {
    const route = STORAGE.getRole();
    const isRecruiter = useUnit($isRecruiter);
    const isAuth = useUnit($isAuth);

    const { data: userInfo } = useGetMainInfoByMeQuery(!isAuth ? skipToken : undefined, {
        skip: isRecruiter || isNull(isRecruiter),
    });
    const { data: recruiterInfo } = useGetInfoRecruiterByMeQuery(!isAuth && !isRecruiter ? skipToken : undefined, {
        skip: !isRecruiter || isNull(isRecruiter),
    });

    const data = isRecruiter ? recruiterInfo : userInfo;

    return (
        <Menu>
            <Menu.Target>
                <button className={s.target}>
                    <Avatar radius='md' size={34} src={data?.avatar_url} />
                </button>
            </Menu.Target>
            <Menu.Dropdown>
                {route === 'user' && (
                    <Menu.Item
                        component={Link}
                        href={`/cabinet/${route}/profile`}
                        leftSection={<UserCircle size={16} />}
                    >
                        Перейти в профиль
                    </Menu.Item>
                )}
                <Menu.Item component={Link} href={`/cabinet/${route}/settings`} leftSection={<Gear size={16} />}>
                    Настройки профиля
                </Menu.Item>
                <Menu.Item leftSection={<SignOut size={16} />}>
                    <button onClick={logoutAction} className={s.logout}>
                        Выйти
                    </button>
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
}
