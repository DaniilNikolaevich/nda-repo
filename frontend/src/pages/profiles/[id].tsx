import { Container } from '@mantine/core';

import { UserProfile } from '@/components/widgets';
import { BaseLayout } from '@/layouts';

function ProfilesPage() {
    return (
        <BaseLayout title='Личный кабинет соискателя'>
            <section>
                <Container>
                    <UserProfile />
                </Container>
            </section>
        </BaseLayout>
    );
}

export default ProfilesPage;
