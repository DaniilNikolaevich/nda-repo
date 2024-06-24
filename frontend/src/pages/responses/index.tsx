import { Container, Paper, Title } from '@mantine/core';

import { ResponsesList } from '@/components/widgets/ResponsesList';
import { BaseLayout } from '@/layouts';

function ResponsesPage() {
    return (
        <BaseLayout title='PeopleFlow | Мои отклики'>
            <section>
                <Container>
                    <Paper p='var(--size-lg)' radius='var(--size-md)'>
                        <Title fz={24} mb='var(--size-lg)'>
                            Мои отклики
                        </Title>
                        <ResponsesList />
                    </Paper>
                </Container>
            </section>
        </BaseLayout>
    );
}

export default ResponsesPage;
