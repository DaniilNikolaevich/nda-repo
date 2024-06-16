import { Box, Button, Flex, Image, Paper, Pill, PillGroup, Text, Title } from '@mantine/core';
import { ChatDots } from '@phosphor-icons/react/dist/ssr/ChatDots';
import { ThumbsUp } from '@phosphor-icons/react/dist/ssr/ThumbsUp';
import dayjs from 'dayjs';
import { isArray } from 'lodash-es';
import NextImage from 'next/image';
import Link from 'next/link';

import { SetLikeButton } from '@/components/features';
import { News } from '@/shared/types/common-models';
import { PartnersNewsBadge } from '@/shared/ui';
import { MemoImage } from '@/shared/ui/MemoImage';
import { extractUrl } from '@/shared/utils';

import s from './PostCard.module.scss';

interface PostCardProps extends News {}

export const PostCard = ({
    cover,
    title,
    external_link,
    tags,
    created_at,
    brief_content,
    likes_count,
    comments_count,
    is_external,
    id,
    is_liked,
}: PostCardProps) => {
    const getSrc = () => {
        if (isArray(cover)) {
            return cover?.[0]?.url.startsWith('http')
                ? cover?.[0]?.url
                : extractUrl(external_link) + '/' + cover?.[0]?.url;
        }

        return cover.url;
    };
    const alt = `Изображение новости: ${title}`;

    return (
        <Paper p='var(--size-lg)' withBorder>
            <Flex direction='column' gap='var(--size-sm)'>
                {cover && <MemoImage width={870} height={420} src={getSrc()} alt={alt} />}
                <Flex justify='space-between'>
                    {tags && tags.length > 0 && (
                        <PillGroup>
                            {tags.map((tag) => (
                                <Pill key={tag.id}>{tag.name}</Pill>
                            ))}
                        </PillGroup>
                    )}
                    <Text c='dimmed'>{dayjs(created_at).format('DD.MM.YYYY')}</Text>
                </Flex>
                <Title order={4}>{title}</Title>
                <Box dangerouslySetInnerHTML={{ __html: brief_content }} className={s.text} />
                <Button
                    w='fit-content'
                    component={Link}
                    href={is_external ? external_link : '/article/' + id}
                    target='_blank'
                    variant='subtle'
                >
                    Читать дальше
                </Button>
                <Flex justify='space-between' align='center'>
                    <Flex gap='var(--size-lg)'>
                        <SetLikeButton likes={likes_count.likes} postId={id} isLiked={is_liked} />
                        {!is_external && (
                            <Button
                                p={0}
                                color='grey.5'
                                bg='white'
                                variant='light'
                                leftSection={<ChatDots size={24} />}
                                component={Link}
                                href={`/article/${id}`}
                            >
                                {comments_count}
                            </Button>
                        )}
                    </Flex>
                    <PartnersNewsBadge hidden={!is_external} />
                </Flex>
            </Flex>
        </Paper>
    );
};
