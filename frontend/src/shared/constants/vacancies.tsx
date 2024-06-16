import { Group } from '@mantine/core';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr/CalendarBlank';
import { ClipboardText } from '@phosphor-icons/react/dist/ssr/ClipboardText';
import { FolderUser } from '@phosphor-icons/react/dist/ssr/FolderUser';
import { Megaphone } from '@phosphor-icons/react/dist/ssr/Megaphone';
import { Sparkle } from '@phosphor-icons/react/dist/ssr/Sparkle';
import { UserSwitch } from '@phosphor-icons/react/dist/ssr/UserSwitch';

import { VacanciesTabItemType } from '../types/process';

export const vacanciesTabsConfig: Array<VacanciesTabItemType> = [
    {
        value: 'recruiting',
        content: (
            <Group gap='var(--size-xs)'>
                <UserSwitch weight='bold' />
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
                <ClipboardText weight='bold' />
                Вакансии
            </Group>
        ),
    },
    {
        value: 'calendar',
        content: (
            <Group gap='var(--size-xs)'>
                <CalendarBlank weight='bold' />
                Календарь
            </Group>
        ),
    },
    {
        value: 'news',
        content: (
            <Group gap='var(--size-xs)'>
                <Megaphone weight='bold' />
                Новости
            </Group>
        ),
        disabled: false,
    },
    {
        value: 'aiProfiles',
        content: (
            <Group gap='var(--size-xs)'>
                <Sparkle weight='bold' />
                AI подборка профилей
            </Group>
        ),
    },
    {
        value: 'profiles',
        content: (
            <Group gap='var(--size-xs)'>
                <FolderUser weight='bold' />
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
