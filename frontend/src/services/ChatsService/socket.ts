import { Centrifuge } from 'centrifuge';

import { STORAGE } from '@/services';
import { API_ROUTES } from '@/shared/api';

export const centrifuge = new Centrifuge(API_ROUTES.ws_chat, {
    token: STORAGE.getChatToken() ?? '',
});
