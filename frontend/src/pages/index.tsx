import { useEffect } from 'react';
import { Container, Flex, Grid, Paper, Title } from '@mantine/core';
import type { GetServerSideProps } from 'next';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import queryString from 'query-string';

import { PostCard } from '@/components/entities';
import { EntitySearchBar, PostsFilterSelect, PostsPagination } from '@/components/features';
import { EmailSubscription } from '@/components/widgets';
import { BaseLayout } from '@/layouts';
import { useAuthorization } from '@/services';
import { API_ROUTES } from '@/shared/api';
import { useIsLaptop } from '@/shared/hooks/media';
import type { NewsModel } from '@/shared/types/common-models';

interface IndexPageProps {
    news: NewsModel;
}

function IndexPage({ news }: IndexPageProps) {
    const { replace, pathname } = useRouter();
    const searchParams = useSearchParams();
    const isLaptop = useIsLaptop();
    const [isAuth] = useAuthorization();

    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        params.set('page', searchParams.get('page') ?? '1');
        params.set('search', searchParams.get('search') ?? '');
        params.set('sortBy', searchParams.get('sortBy') ?? '');
        params.set('sortDesc', searchParams.get('sortDesc') ?? '');
        if (!params.get('sortBy')) {
            params.delete('sortBy');
        }
        if (!params.get('search')) {
            params.delete('search');
        }
        if (!params.get('sortDesc')) {
            params.delete('sortDesc');
        }
        replace(`${pathname}?${params.toString()}`);
    }, []);

    return (
        <BaseLayout title='Главная'>
            <section>
                <Container>
                    <Container>
                        <Title order={2} mb='var(--size-lg)'>
                            Популярные новости
                        </Title>
                    </Container>
                    <Grid gutter='var(--size-lg)' pos='relative'>
                        <Grid.Col offset={isLaptop && isAuth ? 1 : 0} span={isLaptop ? 9 : 12}>
                            <Paper p='var(--size-lg)'>
                                <Flex gap='var(--size-sm)' mb='var(--size-lg)'>
                                    <EntitySearchBar placeholder='Найти новость' />
                                    <PostsFilterSelect />
                                </Flex>
                                <Flex mb='var(--size-lg)' gap='var(--size-lg)' direction='column'>
                                    {news.payload.map((article) => (
                                        <PostCard key={article.id} {...article} />
                                    ))}
                                </Flex>

                                <PostsPagination total={news.total_pages} />
                            </Paper>
                        </Grid.Col>
                        {!isAuth && (
                            <Grid.Col order={isLaptop ? 2 : -1} span={isLaptop ? 3 : 12}>
                                <EmailSubscription />
                            </Grid.Col>
                        )}
                    </Grid>
                </Container>
            </section>
        </BaseLayout>
    );
}

export default IndexPage;

export const getServerSideProps: GetServerSideProps<{
    news: NewsModel;
}> = async ({ query, res }) => {
    res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59');
    const queries = queryString.stringify(query);
    const fetchAllNews = await fetch(`${API_ROUTES.baseUrl}${API_ROUTES.news}?${queries}`);
    const news = await fetchAllNews.json();

    return {
        props: {
            news,
        },
    };
};
