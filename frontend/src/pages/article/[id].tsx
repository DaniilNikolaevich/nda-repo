import { Button, Container, Flex } from '@mantine/core';
import { CaretLeft } from '@phosphor-icons/react/dist/ssr/CaretLeft';
import { ChatDots } from '@phosphor-icons/react/dist/ssr/ChatDots';
import { isArray } from 'lodash-es';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';

import { ArticleView } from '@/components/entities';
import { SetLikeButton } from '@/components/features';
import { Comments } from '@/components/widgets';
import { BaseLayout } from '@/layouts';
import { API_ROUTES } from '@/shared/api';
import type { News } from '@/shared/types/common-models';

function ArticlePage({ article, image }: { article: News; image: string }) {
    return (
        <BaseLayout title='Статья'>
            <section>
                <Container>
                    <Flex direction='column' gap='var(--size-lg)'>
                        <Button
                            w='fit-content'
                            variant='transparent'
                            mt='var(--size-lg)'
                            component={Link}
                            href='..'
                            leftSection={<CaretLeft size={16} />}
                        >
                            Назад
                        </Button>
                        <ArticleView
                            {...article}
                            image={image}
                            likesActionSlot={
                                <SetLikeButton
                                    likes={article.likes_count.likes}
                                    postId={article.id}
                                    isLiked={article.is_liked}
                                />
                            }
                            commentsActionSlot={
                                <>
                                    {!article.is_external && (
                                        <Button
                                            p={0}
                                            color='grey.5'
                                            bg='white'
                                            variant='light'
                                            leftSection={<ChatDots size={24} />}
                                            component={Link}
                                            href={`/article/${article.id}`}
                                        >
                                            {article.comments_count}
                                        </Button>
                                    )}
                                </>
                            }
                        />
                        <Comments />
                    </Flex>
                </Container>
            </section>
        </BaseLayout>
    );
}

export default ArticlePage;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const fetchArticles = await fetch(`${API_ROUTES.baseUrl}${API_ROUTES.news}/${params?.id}`);
    const article = (await fetchArticles.json()) as News;

    const image = isArray(article.cover) ? article?.cover?.[0].url : article.cover.url;

    return {
        props: {
            article,
            image,
        },
    };
};
