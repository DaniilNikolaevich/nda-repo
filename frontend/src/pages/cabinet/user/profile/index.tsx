import { Container } from '@mantine/core';

import { UserProfile } from '@/components/widgets';
import { BaseLayout } from '@/layouts';

function UserPage() {
    return (
        <BaseLayout title='PeopleFlow | Личный кабинет соискателя'>
            <Container>
                <UserProfile />
            </Container>
        </BaseLayout>
    );
}

export default UserPage;
