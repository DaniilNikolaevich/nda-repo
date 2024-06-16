import { Container, Grid } from '@mantine/core';
import { GetServerSideProps } from 'next';

import { FullVacancyCard } from '@/components/entities';
import { RecruiterBlock } from '@/components/widgets';
import { BaseLayout } from '@/layouts';
import { API_ROUTES } from '@/shared/api';
import type { RecruiterModel, VacancyModel } from '@/shared/types/common-models';

interface VacancyProps {
    vacancy: VacancyModel;
    recruiter: RecruiterModel;
}

function VacancyPage({ vacancy, recruiter }: VacancyProps) {
    return (
        <BaseLayout title='Вакансия'>
            <section>
                <Container>
                    <Grid columns={12} pos='relative'>
                        <Grid.Col span={9}>
                            <FullVacancyCard {...vacancy} />
                        </Grid.Col>
                        <Grid.Col span={3} pos='sticky' top={72}>
                            <RecruiterBlock {...recruiter} />
                        </Grid.Col>
                    </Grid>
                </Container>
            </section>
        </BaseLayout>
    );
}

export default VacancyPage;

export const getServerSideProps: GetServerSideProps<{
    vacancy: VacancyModel;
}> = async ({ params }) => {
    const fetchVacancy = await fetch(`${API_ROUTES.baseUrl}${API_ROUTES.vacancies}/${params?.id}`);
    const vacancy = await fetchVacancy.json();

    return {
        props: {
            vacancy,
            recruiter: vacancy.responsible_recruiter,
        },
    };
};
