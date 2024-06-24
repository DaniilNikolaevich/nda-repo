import { useEffect } from 'react';

import { SelectDateForInterview } from '@/components/entities';
import { BaseLayout } from '@/layouts';
import { STORAGE } from '@/services';

function TimeSelectionPage() {
    const token = STORAGE.getToken();

    useEffect(() => {
        if (!token) {
            window.location.href = '/auth';
        }
    }, [token]);

    return (
        <BaseLayout title='Выбор слота для интервью'>
            <SelectDateForInterview />
        </BaseLayout>
    );
}

export default TimeSelectionPage;
