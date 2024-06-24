import { useEffect } from 'react';
import { Container, Flex, Grid, Paper, Title, useMantineColorScheme } from '@mantine/core';
import { useUnit } from 'effector-react';
import type { GetServerSideProps } from 'next';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import queryString from 'query-string';

import { PostCard } from '@/components/entities';
import { EntitySearchBar, PostsFilterSelect, PostsPagination } from '@/components/features';
import { EmailSubscription } from '@/components/widgets';
import { BaseLayout } from '@/layouts';
import { $isAuth } from '@/services';
import { API_ROUTES } from '@/shared/api';
import { useIsLaptop } from '@/shared/hooks/media';
import type { NewsModel } from '@/shared/types/common-models';

interface IndexPageProps {
    news: NewsModel;
}

function IndexPage({ news }: IndexPageProps) {
    const isAuth = useUnit($isAuth);
    const { replace, pathname } = useRouter();
    const searchParams = useSearchParams();
    const isLaptop = useIsLaptop();

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

    const { colorScheme } = useMantineColorScheme();
    const isDarkMode = colorScheme === 'dark';

    return (
        <BaseLayout title='PeopleFlow | Главная'>
            <section>
                <Container p={0}>
                    <Title order={2} mb='var(--size-lg)' c={isDarkMode ? 'white' : 'black'}>
                        Популярные новости
                    </Title>
                    <Grid gutter='var(--size-lg)' pos='relative'>
                        <Grid.Col offset={isLaptop && isAuth ? 1 : 0} span={isLaptop ? 9 : 12}>
                            <Paper pt={0} bg='transparent'>
                                <Flex gap='var(--size-sm)' mb='var(--size-lg)'>
                                    <EntitySearchBar placeholder='Найти новость' />
                                    <PostsFilterSelect />
                                </Flex>
                                <Flex mb='var(--size-lg)' gap='var(--size-lg)' direction='column'>
                                    {news?.payload?.map((article) => <PostCard key={article.id} {...article} />)}
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

    let news = {} as NewsModel;

    try {
        const fetchAllNews = await fetch(`${API_ROUTES.baseUrl}${API_ROUTES.news}?${queries}`);
        news = await fetchAllNews.json();
    } catch (e) {
        if (e instanceof Error) {
            console.error(e.message);
        }
    }

    return {
        props: {
            news,
        },
    };
};
