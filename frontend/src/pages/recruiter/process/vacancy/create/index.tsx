import { Container, Title } from '@mantine/core';

import { VacancyForm } from '@/components/widgets';
import { BaseLayout } from '@/layouts';

function CreatePage() {
    return (
        <BaseLayout title='PeopleFlow | Создание новой вакансии'>
            <section>
                <Container>
                    <Title mb={24} fz={24} order={4}>
                        Новая вакансия
                    </Title>
                    <VacancyForm />
                </Container>
            </section>
        </BaseLayout>
    );
}

export default CreatePage;
