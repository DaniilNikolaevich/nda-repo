import type { ReactNode } from 'react';

export type VacanciesTabTypes = 'dashboard' | 'recruiting' | 'vacancies' | 'calendar' | 'news' | 'profiles';

export interface VacanciesTabItemType {
    value: VacanciesTabTypes;
    content: ReactNode;
    disabled?: boolean;
    withQuery?: boolean;
}
