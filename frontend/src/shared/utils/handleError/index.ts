import { notifications } from '@mantine/notifications';

import { isServerError } from '@/shared/types';

export const handleError = (e: unknown) => {
    if (e instanceof Error) {
        console.error(e.message);
    }
    if (isServerError(e)) {
        notifications.show({
            title: 'Произошла ошибка!',
            message: e.data.message,
            color: 'red',
        });
    } else {
        notifications.show({
            title: 'Произошла ошибка!',
            message: 'Пожалуйста, повторите попытку позднее',
            color: 'red',
        });
    }
};
