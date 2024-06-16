import { Button, Center, Flex, Stack, Text } from '@mantine/core';
import Link from 'next/link';
import { useRouter } from 'next/router';

import Empty from './empty.svg';

export const EmptyState = ({ show }: { show: boolean }) => {
    const {
        query: { chatId },
    } = useRouter();
    const renderEmptyState = () => {
        if (!show) {
            return (
                <Center h='calc(100vh - 80px)'>
                    <Flex direction='column' gap='var(--size-lg)' align='center' justify='center'>
                        <Empty />
                        <Text fw={600} fz={18}>
                            Откликнитесь на вакансию, чтобы создать чат
                        </Text>
                        <Button w='fit-content' component={Link} href='/vacancies'>
                            Перейти к поиску вакансий
                        </Button>
                    </Flex>
                </Center>
            );
        }
        if (!chatId) {
            return (
                <Center h='calc(100vh - 80px)'>
                    <Stack>
                        <Empty />
                        <Text fw={600} fz={18}>
                            Чтобы начать диалог - выберите чат
                        </Text>
                    </Stack>
                </Center>
            );
        }
        return null;
    };

    return renderEmptyState();
};
