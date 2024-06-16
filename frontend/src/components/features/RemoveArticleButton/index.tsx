import { useEffect } from 'react';
import { ActionIcon, Button, Group, Popover, Text, Title } from '@mantine/core';
import { useClickOutside, useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { TrashSimple } from '@phosphor-icons/react/dist/ssr/TrashSimple';

import { useRemoveArticleMutation } from '@/services/NewsService';

export const RemoveArticleButton = ({ id }: { id: string }) => {
    const [opened, { close, open }] = useDisclosure(false);
    const [removeArticle, { isLoading, isError, isSuccess }] = useRemoveArticleMutation();
    const ref = useClickOutside(close);

    const onRemoveArticleHandler = async () => {
        await removeArticle(id);
    };

    useEffect(() => {
        if (!isError) return;
        notifications.show({
            color: 'red',
            title: 'Ошибка!',
            message: 'При удалении публикации произошла ошибка.',
        });
    }, [isError]);

    useEffect(() => {
        if (!isSuccess) return;
        notifications.show({
            title: 'Успешно!',
            message: 'Публикация удалена.',
        });
        close();
    }, [isSuccess]);

    return (
        <Popover shadow='sm' radius='lg' width={310} opened={opened} closeOnClickOutside position='bottom-end'>
            <Popover.Target>
                <ActionIcon variant='outline' size='lg' onClick={open}>
                    <TrashSimple weight='bold' />
                </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown ref={ref} p='var(--size-lg)'>
                <Title size='md' order={5} mb='var(--size-xxs)'>
                    Удаление новости
                </Title>
                <Text size='sm'>Это действие нельзя будет отменить.</Text>
                <Text mb='var(--size-sm)' size='sm'>
                    Вы действительно хотите удалить новость?
                </Text>
                <Group>
                    <Button loading={isLoading} size='xs' onClick={onRemoveArticleHandler}>
                        Да, удалить
                    </Button>
                    <Button size='xs' onClick={close} variant='outline'>
                        Отмена
                    </Button>
                </Group>
            </Popover.Dropdown>
        </Popover>
    );
};
