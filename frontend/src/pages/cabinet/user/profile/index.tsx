import { Flex } from '@mantine/core';

import { ProfileApplicantContacts, ProfileApplicantInfo, UserProfile } from '@/components/widgets';
import { BaseLayout } from '@/layouts';

function UserPage() {
    return (
        <BaseLayout title='Личный кабинет соискателя'>
            <UserProfile />
        </BaseLayout>
    );
}

export default UserPage;
