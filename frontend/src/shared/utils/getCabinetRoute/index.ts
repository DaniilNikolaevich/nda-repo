import { ROLES_NAMES } from '@/shared/types/common-models';

export const getCabinetRoute = (role: ROLES_NAMES) => {
    if (role === 'USER') {
        return 'user';
    }

    if (role === 'ADMIN') {
        return 'admin';
    }

    return 'recruiter';
};
