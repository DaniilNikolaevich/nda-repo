import { Container, Paper, Title } from '@mantine/core';

import { CreateNewPost } from '@/components/widgets';
import { BaseLayout } from '@/layouts';
import { ProtectedRoute } from '@/shared/ui';

function EditArticlePage() {
    return (
        <BaseLayout title='Редактирование новости'>
            <ProtectedRoute>
                <section>
                    <Container maw={950}>
                        <Title order={2} mb='var(--size-lg)'>
                            Редактирование новости
                        </Title>
                        <Paper px='var(--size-5xl)' py='var(--size-lg)'>
                            <CreateNewPost />
                        </Paper>
                    </Container>
                </section>
            </ProtectedRoute>
        </BaseLayout>
    );
}

export default EditArticlePage;
