import { Group } from '@mantine/core';
import { ClipboardText } from '@phosphor-icons/react/dist/ssr/ClipboardText';
import { FolderUser } from '@phosphor-icons/react/dist/ssr/FolderUser';
import { Megaphone } from '@phosphor-icons/react/dist/ssr/Megaphone';
import { UserSwitch } from '@phosphor-icons/react/dist/ssr/UserSwitch';

import { VacanciesTabItemType } from '../types/process';

export const vacanciesTabsConfig: Array<VacanciesTabItemType> = [
    {
        value: 'dashboard',
        content: <>Дашборд</>,
        disabled: true,
    },
    {
        value: 'recruiting',
        content: (
            <Group gap='var(--size-xs)'>
                <UserSwitch />
                Рекрутинг
            </Group>
        ),
        disabled: false,
        withQuery: true,
    },
    {
        value: 'vacancies',
        content: (
            <Group gap='var(--size-xs)'>
                <ClipboardText />
                Вакансии
            </Group>
        ),
    },
    {
        value: 'calendar',
        content: 'Календарь',
    },
    {
        value: 'news',
        content: (
            <Group gap='var(--size-xs)'>
                <Megaphone />
                Новости
            </Group>
        ),
        disabled: false,
    },
    {
        value: 'profiles',
        content: (
            <Group gap='var(--size-xs)'>
                <FolderUser />
                Все профили
            </Group>
        ),
        disabled: false,
    },
];

export const vacanciesStatus: Record<string, number> = {
    Новая: 0,
    Активная: 1,
    Неактивная: 2,
    Закрытая: 3,
    Завершенная: 4,
    Архивная: 5,
};
