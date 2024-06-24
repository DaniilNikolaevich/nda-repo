import { Container, Grid } from '@mantine/core';
import { GetServerSideProps } from 'next';

import { FullVacancyCard } from '@/components/entities';
import { RecruiterBlock, SimilarVacancies } from '@/components/widgets';
import { BaseLayout } from '@/layouts';
import { API_ROUTES } from '@/shared/api';
import { useIsTablet } from '@/shared/hooks/media';
import type { RecruiterModel, VacancyModel } from '@/shared/types/common-models';

interface VacancyProps {
    vacancy: VacancyModel;
    recruiter: RecruiterModel;
}

function VacancyPage({ vacancy, recruiter }: VacancyProps) {
    const isTablet = useIsTablet();

    return (
        <BaseLayout title='Вакансия'>
            <section>
                <Container>
                    <Grid columns={12} pos='relative'>
                        <Grid.Col span={isTablet ? 3 : 12} pos={isTablet ? 'sticky' : 'static'} top={72}>
                            <RecruiterBlock {...recruiter} />
                        </Grid.Col>
                        <Grid.Col span={isTablet ? 9 : 12} order={isTablet ? -1 : 0}>
                            <FullVacancyCard {...vacancy} />
                        </Grid.Col>
                    </Grid>
                    <Grid columns={12}>
                        <Grid.Col span={isTablet ? 9 : 12}>
                            <SimilarVacancies />
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
