import { isObject } from 'lodash-es';

import type { RefreshTokenResponse } from '@/shared/api';

export function isRefreshTokenResponse(data: unknown): data is { access_token: string } {
    return isObject(data) && 'access_token' in data;
}
