import { jwtDecode } from 'jwt-decode';

import { STORAGE } from '@/services';
import { ROLES, ROLES_TYPE } from '@/shared/types/common-models';

export const useGetRole = () => {
    const token = STORAGE.getToken() ?? '';
    const role = token && ((jwtDecode(token) ?? {}) as { role: ROLES_TYPE }).role;
    const isRecruiter = role === ROLES.RECRUITER;
    const isAuth = token !== '';

    return {
        isRecruiter,
        isAuth,
    };
};
