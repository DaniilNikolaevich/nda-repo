import { Button, Tooltip, useMantineColorScheme } from '@mantine/core';
import { ThumbsUp } from '@phosphor-icons/react/dist/ssr/ThumbsUp';
import { useUnit } from 'effector-react';
import { useRouter } from 'next/router';
import queryString from 'query-string';

import { $isAuth } from '@/services';
import { useSetLikeMutation } from '@/services/NewsService';

export const SetLikeButton = ({ likes, postId, isLiked }: { likes: number; postId: string; isLiked: boolean }) => {
    const isAuth = useUnit($isAuth);
    const { pathname, replace, query } = useRouter();
    const [setLike] = useSetLikeMutation();

    const onSetLikeHandler = async () => {
        if (!isAuth) return;
        setLike({
            news_id: postId,
            type: 'like',
        });
        await replace(`${pathname}?${queryString.stringify(query)}`, `${pathname}?${queryString.stringify(query)}`, {
            scroll: false,
        });
    };

    const { colorScheme } = useMantineColorScheme();
    const isDarkMode = colorScheme === 'dark';

    if (!isAuth) {
        return (
            <Tooltip label='Войдите, чтобы оставлять реакции'>
                <Button
                    p={0}
                    color='grey.5'
                    bg={isDarkMode ? 'transparent' : 'white'}
                    variant='light'
                    leftSection={<ThumbsUp size={24} />}
                >
                    {likes}
                </Button>
            </Tooltip>
        );
    }

    return (
        <Button
            p={0}
            color={isLiked ? 'indigo.5' : 'grey.5'}
            bg={isDarkMode ? 'transparent' : 'white'}
            variant='light'
            leftSection={<ThumbsUp size={24} />}
            onClick={onSetLikeHandler}
        >
            {likes}
        </Button>
    );
};
