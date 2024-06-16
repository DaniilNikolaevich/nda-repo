export type ROLES_TYPE = 0 | 1 | 2;
export type ROLES_NAMES = 'USER' | 'ADMIN' | 'RECRUITER';
export const ROLES: Record<ROLES_NAMES, ROLES_TYPE> = {
    USER: 0,
    ADMIN: 1,
    RECRUITER: 2,
} as const;
