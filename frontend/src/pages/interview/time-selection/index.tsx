import { useRouter } from 'next/router';

import { SelectDateForInterview } from '@/components/entities';
import { BaseLayout } from '@/layouts';

function TimeSelectionPage() {
    return (
        <BaseLayout title='Выбор слота для интервью'>
            <SelectDateForInterview />
        </BaseLayout>
    );
}

export default TimeSelectionPage;
