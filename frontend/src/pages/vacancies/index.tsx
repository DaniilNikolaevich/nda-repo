import { Container, Grid, Title } from '@mantine/core';

import { TelegramBot, VacanciesBlock } from '@/components/widgets';
import { BaseLayout } from '@/layouts';
import { useIsLaptop } from '@/shared/hooks/media';

function VacanciesPage() {
    const isLaptop = useIsLaptop();

    return (
        <BaseLayout title='PeopleFlow | Вакансии'>
            <section>
                <Container>
                    <Title order={2} mb='var(--size-lg)'>
                        Вакансии
                    </Title>
                    <Grid gutter='var(--size-lg)' pos='relative'>
                        <Grid.Col span={isLaptop ? 9 : 12}>
                            <VacanciesBlock />
                        </Grid.Col>
                        <Grid.Col order={isLaptop ? 2 : -1} span={isLaptop ? 3 : 12}>
                            <TelegramBot />
                        </Grid.Col>
                    </Grid>
                </Container>
            </section>
        </BaseLayout>
    );
}

export default VacanciesPage;
